import { SqliteCache } from "../../src/platforms/shared/sqliteCache";
import type { Options } from "../../src/defs/options";
import type { ICache } from "../../src/defs/cache";
import { createWorkerHarness, type WorkerHarness } from "./workerHarness";

export type TestServerCache = {
    cache: ICache;
    harness: WorkerHarness;
    cleanup: () => Promise<void>;
};

export async function createTestServerCache(options?: Options): Promise<TestServerCache> {
    const harness = await createWorkerHarness();
    const cache = new SqliteCache(
        { sqlite: harness.sqlite, blobs: harness.blobs },
        options,
    );

    return {
        cache,
        harness,
        cleanup: harness.cleanup,
    };
}
