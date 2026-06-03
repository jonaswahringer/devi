import { afterEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { INLINE_THRESHOLD_BYTES } from "../../src/defs/constants";
import { CacheOps } from "../../src/engine/ops";
import { toBytes } from "../../src/engine/seder";
import { largeBytes, sampleEntry, smallBytes } from "../helpers/fixtures";
import { createWorkerHarness, type WorkerHarness } from "../helpers/workerHarness";

describe("RPC atomicity", () => {
    let harness: WorkerHarness;

    afterEach(async () => {
        await harness?.cleanup();
    });

    test("concurrent upserts on the same key leave one complete row", async () => {
        harness = await createWorkerHarness();
        const base = sampleEntry({ cache_key: "race" });

        await Promise.all(
            Array.from({ length: 10 }, (_, i) =>
                harness.sqlite.upsertEntry({
                    ...base,
                    inline_value: new Uint8Array([i]),
                    byte_size: 1,
                    last_accessed: Date.now() + i,
                }),
            ),
        );

        const result = await harness.sqlite.getEntry("default", "race");
        expect(result).toBeDefined();
        expect(result!.inline_value).toBeInstanceOf(Uint8Array);
        expect(result!.inline_value!.byteLength).toBe(1);
    });

    test("CacheOps.set large value creates matching blob and row", async () => {
        harness = await createWorkerHarness();
        const ops = new CacheOps(harness.sqlite, harness.blobs, "default");
        const data = largeBytes();

        await ops.set("atomic-big", data);
        const entry = await harness.sqlite.getEntry("default", "atomic-big");
        expect(entry?.storage_kind).toBe("file");

        const blobPath = join(harness.env.blobRoot, entry!.file_path!);
        expect(existsSync(blobPath)).toBe(true);
        expect(await harness.blobs.read(entry!.file_path!)).toEqual(toBytes(data));
        expect(await ops.get("atomic-big")).toEqual(data);
    });

    test("CacheOps.delete removes file-backed blob and row", async () => {
        harness = await createWorkerHarness();
        const ops = new CacheOps(harness.sqlite, harness.blobs, "default");

        await ops.set("atomic-delete", largeBytes());
        const entry = await harness.sqlite.getEntry("default", "atomic-delete");
        const filePath = entry!.file_path!;

        await ops.delete("atomic-delete");
        expect(await harness.sqlite.getEntry("default", "atomic-delete")).toBeUndefined();
        expect(await harness.blobs.read(filePath)).toBeUndefined();
    });

    test("CacheOps.set replaces file-backed value with inline and removes old blob", async () => {
        harness = await createWorkerHarness();
        const ops = new CacheOps(harness.sqlite, harness.blobs, "default", INLINE_THRESHOLD_BYTES);

        await ops.set("swap-inline", largeBytes());
        const entry = await harness.sqlite.getEntry("default", "swap-inline");
        const oldPath = entry!.file_path!;

        await ops.set("swap-inline", smallBytes(8));
        expect(await harness.blobs.read(oldPath)).toBeUndefined();

        const updated = await harness.sqlite.getEntry("default", "swap-inline");
        expect(updated?.storage_kind).toBe("inline");
    });

    test("RPC errors reject the caller promise", async () => {
        harness = await createWorkerHarness();
        await expect(
            harness.blobs.read("../escape.bin"),
        ).rejects.toThrow("Invalid blob path");
    });
});
