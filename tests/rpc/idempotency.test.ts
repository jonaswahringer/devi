import { afterEach, describe, expect, test } from "bun:test";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { resetWorkerPoolForTests, WorkerPool } from "../../src/engine/workers";
import { WorkerRpcQueue } from "../../src/engine/workers/queue";
import * as blob from "../../src/platforms/server/cacheWorkerBlob";
import * as sqlite from "../../src/platforms/server/cacheWorkerSqlite";
import { cacheWorkerUrl } from "../../src/platforms/workers/scripts";
import { sampleEntry } from "../helpers/fixtures";
import { MockWorker } from "../helpers/mockWorker";
import { createTempCacheEnv, type TempCacheEnv } from "../helpers/tempEnv";
import { createWorkerHarness, type WorkerHarness } from "../helpers/workerHarness";

describe("RPC idempotency", () => {
    test("markReady twice sends queued RPC exactly once", () => {
        const worker = new MockWorker();
        const queue = new WorkerRpcQueue(worker as unknown as Worker);

        queue.sendRpc("req-1", "getEntry", { group: "g", key: "k" });
        queue.markReady();
        queue.markReady();

        expect(worker.posted).toHaveLength(1);
    });
});

describe("worker spawn reuse", () => {
    let env: TempCacheEnv;
    let workerId: string;
    let pool: WorkerPool;

    afterEach(async () => {
        if (pool?.has(workerId)) {
            pool.terminate(workerId);
        }
        await env?.cleanup();
        resetWorkerPoolForTests();
    });

    test("spawn with same workerId returns the same worker instance", async () => {
        env = await createTempCacheEnv();
        pool = WorkerPool.getInstance();
        workerId = `devi-cache-test-reuse-${crypto.randomUUID()}`;

        const first = pool.spawn(workerId, cacheWorkerUrl("server"), {
            dbPath: env.dbPath,
            blobRoot: env.blobRoot,
        });
        const second = pool.spawn(workerId, cacheWorkerUrl("server"), {
            dbPath: env.dbPath,
            blobRoot: env.blobRoot,
        });

        expect(second).toBe(first);
    });
});

describe("store init idempotency", () => {
    let env: TempCacheEnv;

    afterEach(async () => {
        sqlite.resetForTests();
        blob.resetForTests();
        await env?.cleanup();
    });

    test("sqlite init preserves existing rows", async () => {
        env = await createTempCacheEnv();
        sqlite.init(env.dbPath);
        const entry = sampleEntry({ cache_key: "persist" });
        sqlite.handle("upsertEntry", { entry });
        sqlite.init(env.dbPath);

        const result = sqlite.handle("getEntry", {
            group: entry.cache_group,
            key: entry.cache_key,
        });
        expect(result).toBeDefined();
    });

    test("blob init preserves existing files", async () => {
        env = await createTempCacheEnv();
        blob.init(env.blobRoot);
        const filePath = join(env.blobRoot, "keep.bin");
        await writeFile(filePath, new Uint8Array([1, 2, 3]));
        blob.init(env.blobRoot);

        const data = await readFile(filePath);
        expect(new Uint8Array(data)).toEqual(new Uint8Array([1, 2, 3]));
    });
});

describe("no-op deletes", () => {
    let harness: WorkerHarness;

    afterEach(async () => {
        await harness?.cleanup();
    });

    test("deleteEntry on missing key does not throw", async () => {
        harness = await createWorkerHarness();
        await expect(
            harness.sqlite.deleteEntry("default", "missing"),
        ).resolves.toBeUndefined();
    });

    test("blobDelete on missing file does not throw", async () => {
        harness = await createWorkerHarness();
        await expect(
            harness.blobs.delete("missing/file.bin"),
        ).resolves.toBeUndefined();
    });
});

describe("upsert idempotency", () => {
    let harness: WorkerHarness;

    afterEach(async () => {
        await harness?.cleanup();
    });

    test("repeated upserts leave one row with the last value", async () => {
        harness = await createWorkerHarness();
        const base = sampleEntry({ cache_key: "repeat" });

        for (let i = 0; i < 5; i++) {
            await harness.sqlite.upsertEntry({
                ...base,
                inline_value: new Uint8Array([i]),
                byte_size: 1,
            });
        }

        const result = await harness.sqlite.getEntry("default", "repeat");
        expect(result?.inline_value).toEqual(new Uint8Array([4]));
    });
});
