import { DEFAULT_GROUP, ICache } from "../../defs/cache";
import { CacheNotAvailableError } from "../../defs/errors";
import { Options } from "../../defs/options";

/**
 * Sync cache backed by `window.localStorage`. Keys and values are JSON strings.
 * `getThenRefresh` is not implemented.
 */
export class LocalStorageCache<T> implements ICache<T> {
    
    group: string;

    constructor(options: Options) {
        this.group = options.group || DEFAULT_GROUP;
    }

    set(key: string, value: T, options?: Options): Promise<void> {
        this._rejectIfNotAvailable();
        window.localStorage.setItem(key, JSON.stringify(value));
        return Promise.resolve();
    }
    
    get(key: string, options?: Options): Promise<T | undefined> {
        this._rejectIfNotAvailable();
        let value = window.localStorage.getItem(key);
        if (value == null) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(JSON.parse(value));
    }
    getThenRefresh(key: string, options?: Options): Promise<T | undefined> {
        throw new Error("Method not implemented.");
    }
    
    delete(key: string): Promise<void> {
        this._rejectIfNotAvailable();
        window.localStorage.removeItem(key);
        return Promise.resolve();
    }

    _rejectIfNotAvailable(): Promise<void> {
        if (typeof window === 'undefined' || !window) {
            throw new CacheNotAvailableError("localStorage is not available in this environment");
        }
        return Promise.resolve();
    }
    
}
