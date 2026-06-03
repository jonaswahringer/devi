import { ICache } from "../defs/cache";
import { InvalidOptionsError } from "../defs/errors";
import { Options } from "../defs/options";
import { createPlatformStores } from "./shared/createWorkerStores";
import { SqliteCache } from "./shared/sqliteCache";
import type { PlatformDetails } from "./types";

const SUPPORTED_RUNTIMES = new Set<PlatformDetails["runtime"]>([
    "server",
    "web",
    "ios",
    "android",
]);

/** Platform cache: all sqlite + blob I/O runs in a worker, async from the main thread. */
export function createPlatformCache(
    platform: PlatformDetails,
    options?: Options,
): ICache {
    if (!SUPPORTED_RUNTIMES.has(platform.runtime)) {
        throw new InvalidOptionsError(`Unsupported runtime: ${platform.runtime}`);
    }
    const stores = createPlatformStores(platform, options);
    return new SqliteCache(stores, options);
}
