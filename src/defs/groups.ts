import { Options, TTL } from "./options";

export type group = 'default' | 'static';

export const getDefaultOptions = (group: string): Options => {
    switch (group) {
        case 'default':
            return {
                group: 'default',
                retentionPolicy: 'persistent',
                scope: 'global',
                ttl: TTL.MINUTE,
                async: false,
            };
        case 'static':
            return {
                group: 'static',
                retentionPolicy: 'persistent',
                scope: 'global',
                ttl: TTL.NO_EXPIRATION,
                async: false,
            };
        default:
            throw new Error(`Invalid group: ${group}`);
    }
}

/**
 * Unsure how to implement user-creatable groups effectively.
 * In the meantime, we'll define a few groups to use out-of-the-box .
 */
// export interface ICacheGroup<T> {
//     /**
//      * Create a cache group, with the specified identifier.
//      * Uses the provided options to configure the cache-layer.
//      * @param group - unique identifier for the cache group
//      * @param options - cache options
//      * @throws {Error} if the group already exists
//      * @throws {Error} if the options are invalid
//      * @throws {Error} if the cache-layer is not supported
//      */
//     create(group: string, options: Options): Promise<void>;

//     /**
//      * Configure the cache for a group.
//      * @param key - object identifier
//      * @param options - cache options
//      * @param group - collection of keys
//      */
//     conf(group: string, options: Options): Promise<void>;

//     /**
//      * Delete a cache group.
//      * @param group - group to delete
//      * @throws {Error} if the group does not exist
//      * @throws {Error} if the group is 'default'
//      */
//     delete(group: string): Promise<void>;
// }
