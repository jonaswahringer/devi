import { CacheValue, DEFAULT_GROUP, ICache } from "../../defs/cache";
import { Options } from "../../defs/options";
import { CacheOps } from "../../engine/ops";
import { DexieStore } from "./dexieStore";
import { OpfsBlobStore } from "./opfsBlobStore";

/**
 * Async web cache backed by `DexieStore` (IndexedDB) and `OpfsBlobStore`.
 */
export class IndexedDbCache implements ICache {

    group: string;
    private readonly ops: CacheOps;
    /** Relative-path blob I/O for file-backed values. */
    private readonly blobs: OpfsBlobStore;

    constructor(options: Options) {
        this.group = options.group || DEFAULT_GROUP;
        this.ops = new CacheOps(new DexieStore(options), this.group);
        this.blobs = new OpfsBlobStore(options);
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
