import { afterEach, describe, expect, test } from "bun:test";
import { resetWorkerPoolForTests, WorkerPool } from "../../src/engine/workers";
import { cacheWorkerUrl } from "../../src/platforms/workers/scripts";
import { createTempCacheEnv, type TempCacheEnv } from "../helpers/tempEnv";

describe("WorkerPool spawn", () => {
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

    test("spawn registers the worker session", async () => {
        env = await createTempCacheEnv();
        pool = WorkerPool.getInstance();
        workerId = `devi-cache-test-spawn-${crypto.randomUUID()}`;

        pool.spawn(workerId, cacheWorkerUrl("server"), {
            dbPath: env.dbPath,
            blobRoot: env.blobRoot,
        });

        expect(pool.has(workerId)).toBe(true);
    });

    test("terminate removes the worker session", async () => {
        env = await createTempCacheEnv();
        pool = WorkerPool.getInstance();
        workerId = `devi-cache-test-term-${crypto.randomUUID()}`;

        pool.spawn(workerId, cacheWorkerUrl("server"), {
            dbPath: env.dbPath,
            blobRoot: env.blobRoot,
        });
        pool.terminate(workerId);

        expect(pool.has(workerId)).toBe(false);
        expect(() => pool.send(workerId, "getEntry", { group: "g", key: "k" })).toThrow(
            `Worker ${workerId} not found`,
        );
    });
});
