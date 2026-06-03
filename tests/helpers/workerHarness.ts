import {
    resetWorkerPoolForTests,
    WorkerBackedBlobStore,
    WorkerBackedStore,
    WorkerPool,
} from "../../src/engine/workers";
import { cacheWorkerUrl } from "../../src/platforms/workers/scripts";
import { createTempCacheEnv, type TempCacheEnv } from "./tempEnv";

export type WorkerHarness = {
    pool: WorkerPool;
    workerId: string;
    sqlite: WorkerBackedStore;
    blobs: WorkerBackedBlobStore;
    env: TempCacheEnv;
    cleanup: () => Promise<void>;
};

export async function createWorkerHarness(): Promise<WorkerHarness> {
    resetWorkerPoolForTests();
    const env = await createTempCacheEnv();
    const pool = WorkerPool.getInstance();
    const workerId = `devi-cache-test-${crypto.randomUUID()}`;

    pool.spawn(workerId, cacheWorkerUrl("server"), {
        dbPath: env.dbPath,
        blobRoot: env.blobRoot,
    });

    return {
        pool,
        workerId,
        sqlite: new WorkerBackedStore(pool, workerId),
        blobs: new WorkerBackedBlobStore(pool, workerId),
        env,
        cleanup: async () => {
            if (pool.has(workerId)) {
                pool.terminate(workerId);
            }
            await env.cleanup();
            resetWorkerPoolForTests();
        },
    };
}
