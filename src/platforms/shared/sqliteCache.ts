import { CacheValue, DEFAULT_GROUP, ICache } from "../../defs/cache";
import { Options } from "../../defs/options";
import { CacheOps } from "../../engine/ops";
import type { PlatformStores } from "./stores";

/**
 * SQLite-backed cache: metadata and large blobs are served from a worker thread.
 */
export class SqliteCache implements ICache {

    group: string;
    private readonly ops: CacheOps;

    constructor(stores: PlatformStores, options?: Options) {
        this.group = options?.group ?? DEFAULT_GROUP;
        this.ops = new CacheOps(stores.sqlite, stores.blobs, this.group);
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
