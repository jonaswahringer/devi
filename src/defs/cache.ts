import { Options } from "./options";

export type CacheType = 'sync' | 'async' | 'stream'

export const DEFAULT_GROUP = 'default';

export interface ICache<T> {

    /**
     * The group which the cache belongs to, if not overriden in options.
     */
    group: string;
     
    /**
     * Set a value in the cache.
     * @param key - object identifier
     * @param value - value to cache
     * @param options - cache options, overrides the group options, e.g., ttl
     */
    set(key: string, value: T, options?: Options): Promise<void>;

    /**
     * 
     * @param key - object identifier
     * @param options - cache options, overrides the group options
     */
    get(key: string, options?: Options): Promise<T | undefined>;
   
    /**
     * Get a value from the cache and refresh the TTL.
     * @param key - object identifier
     * @param options - cache options, overrides the group options, e.g., ttl
     */
    getThenRefresh(key: string, options?: Options): Promise<T | undefined>;
    
    /**
     * Delete a value from the cache.
     * @param key - object identifier
     */
    delete(key: string): Promise<void>;

}

export interface SyncCache<T> extends ICache<T> {
    readonly type: 'sync';
}

export interface AsyncCache<T> extends ICache<T> {
    readonly type: 'async';
}

export interface StreamCache<T> extends ICache<T> {
    readonly type: 'stream';
}
