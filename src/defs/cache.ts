import { Options } from "./options";

export type CacheType = 'sync' | 'async' | 'stream'

export const DEFAULT_GROUP = 'default';

/** Serialized JSON string or binary blob payload. */
export type CacheValue = string | Uint8Array;

export interface ICache {

    /**
     * The group which the cache belongs to, if not overriden in options.
     */
    group: string;
     
    /**
     * Set a value in the cache.
     * @param key - object identifier
     * @param value - JSON string or blob payload
     * @param options - cache options, overrides the group options, e.g., ttl
     */
    set(key: string, value: CacheValue, options?: Options): Promise<void>;

    /**
     * @param key - object identifier
     * @param options - cache options; set `refreshTtl: true` to slide TTL / touch LRU on read
     */
    get(key: string, options?: Options): Promise<CacheValue | undefined>;

    /**
     * Delete a value from the cache.
     * @param key - object identifier
     */
    delete(key: string): Promise<void>;

}
