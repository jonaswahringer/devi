import type { CacheValue, ICache } from "../defs/cache";
import type { Options } from "../defs/options";

/**
 * Read persisted T0 data from a devi cache instance.
 * Intended for TanStack Query `placeholderData`, `initialData`, or `queryClient.setQueryData` seeding.
 */
export function read(
    cache: ICache,
    key: string,
    options?: Options,
): Promise<CacheValue | undefined> {
    return cache.get(key, options);
}
