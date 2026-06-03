import type { AppRuntime } from "../types";

/** Entry script URL for the platform cache worker (SQLite + blobs). */
export function cacheWorkerUrl(runtime: AppRuntime): URL {
    switch (runtime) {
        case "server":
            return new URL("../server/cacheWorker.ts", import.meta.url);
        case "web":
            return new URL("../web/cacheWorker.ts", import.meta.url);
        case "ios":
        case "android":
            return new URL("../mobile/cacheWorker.ts", import.meta.url);
        default:
            throw new Error(`No cache worker for runtime: ${runtime}`);
    }
}

/** Stable worker id per runtime (one cache worker per platform in-process). */
export function cacheWorkerId(runtime: AppRuntime): string {
    return `devi-cache-${runtime}`;
}
