import { afterEach, describe, expect, test } from "bun:test";
import { sampleEntry, smallBytes } from "../helpers/fixtures";
import { createWorkerHarness, type WorkerHarness } from "../helpers/workerHarness";

describe("WorkerBackedStore + WorkerBackedBlobStore", () => {
    let harness: WorkerHarness;

    afterEach(async () => {
        await harness?.cleanup();
    });

    test("inline entry CRUD over RPC", async () => {
        harness = await createWorkerHarness();
        const entry = sampleEntry({ cache_key: "rpc-inline" });

        await harness.sqlite.upsertEntry(entry);
        const fetched = await harness.sqlite.getEntry(entry.cache_group, entry.cache_key);
        expect(fetched?.cache_key).toBe("rpc-inline");
        expect(fetched?.inline_value).toEqual(entry.inline_value);

        await harness.sqlite.deleteEntry(entry.cache_group, entry.cache_key);
        const missing = await harness.sqlite.getEntry(entry.cache_group, entry.cache_key);
        expect(missing).toBeUndefined();
    });

    test("blob write/read/delete over RPC", async () => {
        harness = await createWorkerHarness();
        const data = smallBytes(64);

        await harness.blobs.write("group/hash/file.bin", data);
        const read = await harness.blobs.read("group/hash/file.bin");
        expect(read).toEqual(data);

        await harness.blobs.delete("group/hash/file.bin");
        const missing = await harness.blobs.read("group/hash/file.bin");
        expect(missing).toBeUndefined();
    });

    test("RPC sent before ready completes without hanging", async () => {
        harness = await createWorkerHarness();
        const pending = harness.sqlite.getEntry("default", "early");
        const entry = sampleEntry({ cache_key: "early" });
        await harness.sqlite.upsertEntry(entry);
        const result = await pending;
        expect(result).toBeUndefined();
    });
});
