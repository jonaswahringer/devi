import type { ICache } from "../defs/cache";
import type { Options } from "../defs/options";

/**
 * Read persisted T0 data from a devi cache instance.
 * Intended for TanStack Query `placeholderData`, `initialData`, or `queryClient.setQueryData` seeding.
 */
export function read<T>(
    cache: ICache<T>,
    key: string,
    options?: Options,
): Promise<T | undefined> {
    return cache.get(key, options);
}
