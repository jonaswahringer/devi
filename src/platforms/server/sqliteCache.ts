import { CacheValue, DEFAULT_GROUP, ICache } from "../../defs/cache";
import { Options } from "../../defs/options";
import { CacheOps } from "../../engine/ops";
import { BunBlobStore } from "./bunBlobStore";
import { BunSqliteStore } from "./bunSqliteStore";

/**
 * Server cache backed by `BunSqliteStore` and `BunBlobStore`.
 */
export class SqliteCache implements ICache {

    group: string;
    private readonly ops: CacheOps;
    /** Relative-path blob I/O under `~/.cache/devi/blobs`. */
    private readonly blobs: BunBlobStore;

    constructor(options?: Options) {
        this.group = options?.group || DEFAULT_GROUP;
        this.ops = new CacheOps(new BunSqliteStore(options), this.group);
        this.blobs = new BunBlobStore(options);
    }

    get(key: string, options?: Options): Promise<CacheValue | undefined> {
        return this.ops.get(key, options);
    }

    set(key: string, value: CacheValue, options?: Options): Promise<void> {
        return this.ops.set(key, value, options);
    }

    delete(key: string, options?: Options): Promise<void> {
        return this.ops.delete(key, options);
    }

}
