import type { CacheEntry } from "./entry";

export interface CacheStore {
    getEntry(group: string, key: string): Promise<CacheEntry | undefined>;
    upsertEntry(entry: CacheEntry): Promise<void>;
    deleteEntry(group: string, key: string): Promise<void>;
    touchEntry(
        group: string,
        key: string,
        lastAccessed: number,
        expiresAt: number | null,
    ): Promise<void>;
}
