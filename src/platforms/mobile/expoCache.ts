import { DEFAULT_GROUP, ICache } from "../../defs/cache";
import { Options } from "../../defs/options";
import { ExpoBlobStore } from "./expoBlobStore";
import { ExpoSqliteStore } from "./expoSqliteStore";

/**
 * Mobile cache backed by `ExpoSqliteStore` and `ExpoBlobStore`.
 * `get`, `set`, `getThenRefresh`, and `delete` are not implemented yet.
 */
export class ExpoCache<T> implements ICache<T> {

    group: string;
    /** `cache_entries` SQL access (TTL, LRU, row metadata). */
    private readonly sqlite: ExpoSqliteStore;
    /** Relative-path blob I/O for file-backed values. */
    private readonly blobs: ExpoBlobStore;

    constructor(options?: Options) {
        this.group = options?.group || DEFAULT_GROUP;
        this.sqlite = new ExpoSqliteStore(options);
        this.blobs = new ExpoBlobStore(options);
    }

    get(key: string, options?: Options): Promise<T | undefined> {
        throw new Error("Method not implemented.");
    }

    getThenRefresh(key: string, options?: Options): Promise<T | undefined> {
        throw new Error("Method not implemented.");
    }

    set(key: string, value: T, options?: Options): Promise<void> {
        throw new Error("Method not implemented.");
    }

    delete(key: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
