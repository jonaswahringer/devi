import { DEFAULT_GROUP, CacheValue, ICache } from "../../defs/cache";
import { CacheNotAvailableError } from "../../defs/errors";
import { Options } from "../../defs/options";

/**
 * Sync cache backed by `window.sessionStorage`. Keys and values are stored as strings.
 */
export class SessionStorageCache implements ICache {

    group: string;

    constructor(options: Options) {
        this.group = options.group || DEFAULT_GROUP;
    }

    set(key: string, value: CacheValue, options?: Options): Promise<void> {
        this._rejectIfNotAvailable();
        if (typeof value !== 'string') {
            throw new Error("sessionStorage only supports string values");
        }
        window.sessionStorage.setItem(key, value);
        return Promise.resolve();
    }

    get(key: string, options?: Options): Promise<CacheValue | undefined> {
        this._rejectIfNotAvailable();
        const value = window.sessionStorage.getItem(key);
        if (value == null) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(value);
    }

    delete(key: string): Promise<void> {
        this._rejectIfNotAvailable();
        window.sessionStorage.removeItem(key);
        return Promise.resolve();
    }

    _rejectIfNotAvailable(): void {
        if (typeof window === 'undefined' || !window) {
            throw new CacheNotAvailableError("sessionStorage is not available in this environment");
        }
    }

}
