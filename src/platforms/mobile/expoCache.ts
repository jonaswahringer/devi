import { DEFAULT_GROUP, CacheValue, ICache } from "../../defs/cache";
import { Options } from "../../defs/options";
import { ExpoBlobStore } from "./expoBlobStore";
import { ExpoSqliteStore } from "./expoSqliteStore";

/**
 * Mobile cache backed by `ExpoSqliteStore` and `ExpoBlobStore`.
 */
export class ExpoCache implements ICache {

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

    get(key: string, options?: Options): Promise<CacheValue | undefined> {
        throw new Error("Method not implemented.");
    }

    set(key: string, value: CacheValue, options?: Options): Promise<void> {
        throw new Error("Method not implemented.");
    }

    delete(key: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
