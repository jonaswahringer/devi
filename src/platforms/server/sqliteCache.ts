import { DEFAULT_GROUP, ICache } from "../../defs/cache";
import { Options } from "../../defs/options";
import { BunBlobStore } from "./bunBlobStore";
import { BunSqliteStore } from "./bunSqliteStore";

/**
 * Server cache backed by `BunSqliteStore` and `BunBlobStore`.
 * `get`, `set`, `getThenRefresh`, and `delete` are not implemented yet.
 */
export class SqliteCache<T> implements ICache<T> {

    group: string;
    /** `cache_entries` SQL access (TTL, LRU, row metadata). */
    private readonly sqlite: BunSqliteStore;
    /** Relative-path blob I/O under `~/.cache/devi/blobs`. */
    private readonly blobs: BunBlobStore;

    constructor(options?: Options) {
        this.group = options?.group || DEFAULT_GROUP;
        this.sqlite = new BunSqliteStore(options);
        this.blobs = new BunBlobStore(options);
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
