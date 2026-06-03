import type { BlobStore } from "../../defs/blob";
import type { CacheStore } from "../../defs/store";

/** SQLite metadata store + blob store for a single runtime. */
export interface PlatformStores {
    sqlite: CacheStore;
    blobs: BlobStore;
}
