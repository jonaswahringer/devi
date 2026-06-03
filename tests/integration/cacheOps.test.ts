import { afterEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { INLINE_THRESHOLD_BYTES } from "../../src/defs/constants";
import { TTL } from "../../src/defs/options";
import { CacheOps } from "../../src/engine/ops";
import { blobRelativePath } from "../../src/engine/paths";
import { largeBytes, sampleEntry, smallBytes } from "../helpers/fixtures";
import { createWorkerHarness, type WorkerHarness } from "../helpers/workerHarness";

describe("CacheOps integration", () => {
    let harness: WorkerHarness;
    let ops: CacheOps;

    afterEach(async () => {
        await harness?.cleanup();
    });

    test("small values are stored inline in SQLite", async () => {
        harness = await createWorkerHarness();
        ops = new CacheOps(harness.sqlite, harness.blobs, "default");

        await ops.set("small", smallBytes(32));
        const value = await ops.get("small");
        expect(value).toEqual(smallBytes(32));

        const entry = await harness.sqlite.getEntry("default", "small");
        expect(entry?.storage_kind).toBe("inline");
    });

    test("large values use the blob store", async () => {
        harness = await createWorkerHarness();
        ops = new CacheOps(harness.sqlite, harness.blobs, "default");

        const data = largeBytes();
        await ops.set("big", data);
        const value = await ops.get("big");

        expect(value).toEqual(data);
        const entry = await harness.sqlite.getEntry("default", "big");
        expect(entry?.storage_kind).toBe("file");
        expect(entry?.file_path).toBe(blobRelativePath("default", "big"));

        const blobPath = join(harness.env.blobRoot, entry!.file_path!);
        expect(existsSync(blobPath)).toBe(true);
    });

    test("replacing a large value with a small one removes the old blob", async () => {
        harness = await createWorkerHarness();
        ops = new CacheOps(harness.sqlite, harness.blobs, "default");

        const data = largeBytes();
        await ops.set("swap", data);
        const entry = await harness.sqlite.getEntry("default", "swap");
        const oldPath = entry!.file_path!;

        await ops.set("swap", smallBytes(4));
        const blobGone = await harness.blobs.read(oldPath);
        expect(blobGone).toBeUndefined();

        const updated = await harness.sqlite.getEntry("default", "swap");
        expect(updated?.storage_kind).toBe("inline");
    });

    test("delete removes row and blob", async () => {
        harness = await createWorkerHarness();
        ops = new CacheOps(harness.sqlite, harness.blobs, "default");

        await ops.set("remove", largeBytes());
        const entry = await harness.sqlite.getEntry("default", "remove");
        const filePath = entry!.file_path!;

        await ops.delete("remove");
        expect(await harness.sqlite.getEntry("default", "remove")).toBeUndefined();
        expect(await harness.blobs.read(filePath)).toBeUndefined();
    });

    test("expired entries are removed on get", async () => {
        harness = await createWorkerHarness();
        ops = new CacheOps(harness.sqlite, harness.blobs, "default", INLINE_THRESHOLD_BYTES);

        const now = Date.now();
        await harness.sqlite.upsertEntry(
            sampleEntry({
                cache_key: "ttl",
                inline_value: new TextEncoder().encode("\0expires"),
                expires_at: now - 1_000,
                last_accessed: now - 1_000,
            }),
        );

        const value = await ops.get("ttl");
        expect(value).toBeUndefined();
        expect(await harness.sqlite.getEntry("default", "ttl")).toBeUndefined();
    });

    test("refreshTtl extends expiration on read", async () => {
        harness = await createWorkerHarness();
        ops = new CacheOps(harness.sqlite, harness.blobs, "default");

        await ops.set("refresh", "value", { ttl: TTL.MINUTE });
        const before = await harness.sqlite.getEntry("default", "refresh");
        const originalExpiry = before!.expires_at!;

        await Bun.sleep(5);
        await ops.get("refresh", { ttl: TTL.MINUTE, refreshTtl: true });

        const after = await harness.sqlite.getEntry("default", "refresh");
        expect(after!.expires_at).toBeGreaterThan(originalExpiry);
    });
});
