
export const TTL = Object.freeze({
    NO_EXPIRATION: 0,
    MINUTE: 60000,
    HOUR: 3600000,
});

export type Retention = 'session' | 'persistent';
export type Scope = 'origin' | 'global'

export interface Options {

    /**
     * The group of objects to cache.
     * @default <name> If not provided, the cache will be created in the group
     * specified in the cache instance, or the default group.
     */
    group?: string;

    /**
     * Retention policy for the cache.
     * @default ['persistent']
     */
    retentionPolicy?: Retention;

    /**
     * The scope of the cache.
     * @default 'global'
     */
    scope?: Scope;

    /**
     * The time to live for the cache in milliseconds.
     * 0 means no expiration.
     * @default 5 * TTL.MINUTE
     */
    ttl?: number;
    
    /**
     * Whether to use async/await syntax.
     * If the cache implementation does not support async/await, this will be ignored.
     * Typically depends on the workflow and data size.
     * @default false
     */
    async?: boolean;
    
}
