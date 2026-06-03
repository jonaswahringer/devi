import { Options } from "../../defs/options";
import { DEFAULT_SERVER_BLOB_ROOT, DEFAULT_SERVER_DB_PATH } from "../../engine/paths";
import {
    WorkerBackedBlobStore,
    WorkerBackedStore,
    WorkerPool,
    type WorkerInitPayload,
} from "../../engine/workers";
import type { AppRuntime, PlatformDetails } from "../types";
import { cacheWorkerId, cacheWorkerUrl } from "../workers/scripts";
import type { PlatformStores } from "./stores";

function workerInit(runtime: AppRuntime): WorkerInitPayload | undefined {
    if (runtime === "server") {
        return { dbPath: DEFAULT_SERVER_DB_PATH, blobRoot: DEFAULT_SERVER_BLOB_ROOT };
    }
    return undefined;
}

/** Spawn one cache worker and return worker-backed sqlite + blob stores. */
export function createPlatformStores(
    platform: PlatformDetails,
    _options?: Options,
): PlatformStores {
    const pool = WorkerPool.getInstance();
    const workerId = cacheWorkerId(platform.runtime);
    pool.spawn(workerId, cacheWorkerUrl(platform.runtime), workerInit(platform.runtime));
    return {
        sqlite: new WorkerBackedStore(pool, workerId),
        blobs: new WorkerBackedBlobStore(pool, workerId),
    };
}
