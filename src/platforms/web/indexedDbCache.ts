import { DEFAULT_GROUP, ICache } from "../../defs/cache";
import { Options } from "../../defs/options";
import { OpfsBlobStore } from "./opfsBlobStore";
import { OpfsSqliteStore } from "./opfsSqliteStore";

/**
 * Async web cache backed by `OpfsSqliteStore` and `OpfsBlobStore`.
 * `get`, `set`, `getThenRefresh`, and `delete` are not implemented yet.
 */
export class IndexedDbCache<T> implements ICache<T> {

    group: string;
    /** `cache_entries` SQL access (TTL, LRU, row metadata). */
    private readonly sqlite: OpfsSqliteStore;
    /** Relative-path blob I/O for file-backed values. */
    private readonly blobs: OpfsBlobStore;

    constructor(options: Options) {
        this.group = options.group || DEFAULT_GROUP;
        this.sqlite = new OpfsSqliteStore(options);
        this.blobs = new OpfsBlobStore(options);
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
