import { CacheType, ICache } from "./defs/cache";
import { InvalidOptionsError } from "./defs/errors";
import { getDefaultOptions } from "./defs/groups";
import { Options } from "./defs/options";
import { FileSystemCache } from "./platforms/fs/cache";
import { PlatformDetails } from "./platforms/types";
import { IndexedDbCache } from "./platforms/web/indexedDb";
import { LocalStorageCache } from "./platforms/web/localStorage";
import { SessionStorageCache } from "./platforms/web/sessionStorage";

export class CacheFactory {

    static create<T>(type: CacheType, platform: PlatformDetails, group?: string, options?: Options): ICache<T> {

        // get platform details
        const runtime = platform.runtime;
        const browser = platform.browser;

        // create options for the cache
        const group_options = getDefaultOptions(group || 'default');
        if (options) {
            options = { ...group_options, ...options };
        }

        if (!options) {
            options = group_options;
        }

        // validate options
        if (options?.ttl && options.ttl < 0) {
            throw new InvalidOptionsError("TTL must be equal to or greater than 0");
        }

        console.log('options', options);
        console.log('runtime', runtime);
        console.log('browser', browser);
        console.log('group', group);
        console.log('group_options', group_options);
        console.log('type', type);

        // create cache instance
        switch (type) {
            case 'sync':
                if (runtime === 'native') {
                    return new FileSystemCache<T>(options);
                }
                if (runtime === 'web') {
                    if (options?.retentionPolicy === 'session') {
                        return new SessionStorageCache<T>(options);
                    } else {
                        return new LocalStorageCache<T>(options);
                    }
                }

            case 'async':
                if (runtime === 'native') {
                    return new FileSystemCache<T>(options);
                }
                if (runtime === 'web') {
                    return new IndexedDbCache<T>(options);
                }
                throw new Error("Invalid runtime");

            case 'stream':
                throw new Error("Not implemented");

        }
    }

}
