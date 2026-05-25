import { CacheType, ICache } from "./defs/cache";
import { InvalidOptionsError } from "./defs/errors";
import { getDefaultOptions } from "./defs/groups";
import { Options } from "./defs/options";
import { ExpoCache } from "./platforms/mobile/expoCache";
import { SqliteCache } from "./platforms/server/sqliteCache";
import { AppRuntime, PlatformDetails } from "./platforms/types";
import { IndexedDbCache } from "./platforms/web/indexedDbCache";
import { LocalStorageCache } from "./platforms/web/localStorageCache";
import { SessionStorageCache } from "./platforms/web/sessionStorageCache";

function isMobileRuntime(runtime: AppRuntime): boolean {
    return runtime === 'ios' || runtime === 'android';
}

function isServerRuntime(runtime: AppRuntime): boolean {
    return runtime === 'server';
}

export class CacheFactory {

    static create(type: CacheType, platform: PlatformDetails, group?: string, options?: Options): ICache {

        const runtime = platform.runtime;
        const browser = platform.browser;

        const group_options = getDefaultOptions(group || 'default');
        if (options) {
            options = { ...group_options, ...options };
        }

        if (!options) {
            options = group_options;
        }

        if (options?.ttl && options.ttl < 0) {
            throw new InvalidOptionsError("TTL must be equal to or greater than 0");
        }

        console.log('options', options);
        console.log('runtime', runtime);
        console.log('browser', browser);
        console.log('group', group);
        console.log('group_options', group_options);
        console.log('type', type);

        switch (type) {
            case 'sync':
                if (runtime === 'web') {
                    if (options?.retentionPolicy === 'session') {
                        return new SessionStorageCache(options);
                    }
                    return new LocalStorageCache(options);
                }
                if (isMobileRuntime(runtime)) {
                    return new ExpoCache(options);
                }
                if (isServerRuntime(runtime)) {
                    return new SqliteCache(options);
                }
                break;

            case 'async':
                if (runtime === 'web') {
                    return new IndexedDbCache(options);
                }
                if (isMobileRuntime(runtime)) {
                    return new ExpoCache(options);
                }
                if (isServerRuntime(runtime)) {
                    return new SqliteCache(options);
                }
                break;

            case 'stream':
                throw new Error("Not implemented");
        }

        throw new Error(`Invalid runtime: ${runtime}`);
    }

}
