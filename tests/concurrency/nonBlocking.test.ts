import { afterEach, describe, expect, test } from "bun:test";
import { CacheOps } from "../../src/engine/ops";
import { createTestServerCache, type TestServerCache } from "../helpers/createTestServerCache";
import { sampleEntry, smallBytes } from "../helpers/fixtures";
import { createWorkerHarness, type WorkerHarness } from "../helpers/workerHarness";

describe("non-blocking worker operations", () => {
    let harness: WorkerHarness;
    let setup: TestServerCache;

    afterEach(async () => {
        await harness?.cleanup();
        await setup?.cleanup();
    });

    test("getEntry yields before completing", async () => {
        harness = await createWorkerHarness();
        const entry = sampleEntry({ cache_key: "yield" });
        await harness.sqlite.upsertEntry(entry);

        const pending = harness.sqlite.getEntry("default", "yield");
        let microtaskRan = false;
        queueMicrotask(() => {
            microtaskRan = true;
        });
        await Promise.resolve();
        expect(microtaskRan).toBe(true);

        await expect(pending).resolves.toBeDefined();
    });

    test("blob.read yields before completing", async () => {
        harness = await createWorkerHarness();
        await harness.blobs.write("yield.bin", smallBytes(4));

        const pending = harness.blobs.read("yield.bin");
        let microtaskRan = false;
        queueMicrotask(() => {
            microtaskRan = true;
        });
        await Promise.resolve();
        expect(microtaskRan).toBe(true);

        await expect(pending).resolves.toBeDefined();
    });

    test("pool.send yields before completing", async () => {
        harness = await createWorkerHarness();
        const pending = harness.pool.send(harness.workerId, "getEntry", {
            group: "default",
            key: "k",
        });

        let microtaskRan = false;
        queueMicrotask(() => {
            microtaskRan = true;
        });
        await Promise.resolve();
        expect(microtaskRan).toBe(true);

        await expect(pending).resolves.toBeUndefined();
    });

    test("cache.set yields before completing", async () => {
        setup = await createTestServerCache();
        const pending = setup.cache.set("yield", "value");

        let microtaskRan = false;
        queueMicrotask(() => {
            microtaskRan = true;
        });
        await Promise.resolve();
        expect(microtaskRan).toBe(true);

        await pending;
    });
});
