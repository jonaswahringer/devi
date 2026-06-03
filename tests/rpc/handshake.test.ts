import { afterEach, describe, expect, test } from "bun:test";
import { resetWorkerPoolForTests, WorkerPool } from "../../src/engine/workers";
import { cacheWorkerUrl } from "../../src/platforms/workers/scripts";
import { createTempCacheEnv, type TempCacheEnv } from "../helpers/tempEnv";

describe("RPC handshake", () => {
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

    test("queues RPC until worker posts ready", async () => {
        env = await createTempCacheEnv();
        pool = WorkerPool.getInstance();
        workerId = `devi-cache-test-handshake-${crypto.randomUUID()}`;

        pool.spawn(workerId, cacheWorkerUrl("server"), {
            dbPath: env.dbPath,
            blobRoot: env.blobRoot,
        });

        const pending = pool.send(workerId, "getEntry", { group: "default", key: "queued" });
        const result = await pending;
        expect(result).toBeUndefined();
    });

    test("init failure rejects pending RPC and resets queue", async () => {
        env = await createTempCacheEnv();
        pool = WorkerPool.getInstance();
        workerId = `devi-cache-test-fail-${crypto.randomUUID()}`;

        pool.spawn(workerId, new URL("../helpers/workers/failingInitWorker.ts", import.meta.url));

        await expect(
            pool.send(workerId, "getEntry", { group: "default", key: "k" }),
        ).rejects.toThrow("init failed");
    });

    test("duplicate RPC responses resolve only once", async () => {
        env = await createTempCacheEnv();
        pool = WorkerPool.getInstance();
        workerId = `devi-cache-test-dup-${crypto.randomUUID()}`;

        pool.spawn(workerId, new URL("../helpers/workers/duplicateResponseWorker.ts", import.meta.url));

        const result = await pool.send(workerId, "getEntry", { group: "default", key: "k" });
        expect(result).toBe("first");
    });
});
