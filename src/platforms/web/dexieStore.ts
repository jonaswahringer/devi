import Dexie, { type Table } from "dexie";
import { CacheEntry } from "../../defs/entry";
import { Options } from "../../defs/options";
import { CacheStore } from "../../defs/store";

/** Dexie row — `inline_value` stored as ArrayBuffer for IndexedDB compatibility. */
type DexieCacheEntryRow = Omit<CacheEntry, "inline_value" | "expires_at"> & {
    inline_value?: ArrayBuffer;
    expires_at?: number | null;
};

class DeviDexie extends Dexie {
    cache_entries!: Table<DexieCacheEntryRow, [string, string]>;

    constructor() {
        super("devi");
        this.version(1).stores({
            cache_entries:
                "[cache_group+cache_key], expires_at, [cache_group+last_accessed]",
        });
    }
}

let sharedDb: DeviDexie | undefined;

function getDb(): DeviDexie {
    sharedDb ??= new DeviDexie();
    return sharedDb;
}

function toDexieRow(entry: CacheEntry): DexieCacheEntryRow {
    const { inline_value, ...rest } = entry;
    if (inline_value == null) {
        return rest;
    }
    const copy = new Uint8Array(inline_value);
    return { ...rest, inline_value: copy.buffer };
}

function fromDexieRow(row: DexieCacheEntryRow): CacheEntry {
    return {
        cache_group: row.cache_group,
        cache_key: row.cache_key,
        storage_kind: row.storage_kind,
        inline_value: row.inline_value == null ? null : new Uint8Array(row.inline_value),
        file_path: row.file_path,
        byte_size: row.byte_size,
        checksum: row.checksum,
        created_at: row.created_at,
        expires_at: row.expires_at ?? null,
        last_accessed: row.last_accessed,
    };
}

/**
 * `cache_entries` access via Dexie.js (IndexedDB, TTL/LRU indexes, inline blobs).
 */
export class DexieStore implements CacheStore {

    private readonly db: DeviDexie;

    constructor(_options?: Options) {
        this.db = getDb();
    }

    async getEntry(group: string, key: string): Promise<CacheEntry | undefined> {
        const row = await this.db.cache_entries.get([group, key]);
        return row ? fromDexieRow(row) : undefined;
    }

    async upsertEntry(entry: CacheEntry): Promise<void> {
        await this.db.cache_entries.put(toDexieRow(entry));
    }

    async deleteEntry(group: string, key: string): Promise<void> {
        await this.db.cache_entries.delete([group, key]);
    }

    async touchEntry(
        group: string,
        key: string,
        lastAccessed: number,
        expiresAt: number | null,
    ): Promise<void> {
        await this.db.cache_entries.update([group, key], {
            last_accessed: lastAccessed,
            expires_at: expiresAt,
        });
    }

}
