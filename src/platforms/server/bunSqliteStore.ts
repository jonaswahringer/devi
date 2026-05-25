import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { CACHE_SCHEMA_SQL, CacheEntry } from "../../defs/entry";
import { Options } from "../../defs/options";
import { CacheStore } from "../../defs/store";

const DEFAULT_DB_PATH = `${process.env.HOME}/.cache/devi/sqlite/cache.sqlite`;

/**
 * `cache_entries` access via `bun:sqlite` (TTL/LRU indexes, inline BLOBs).
 */
export class BunSqliteStore implements CacheStore {

    private readonly db: Database;

    constructor(_options?: Options, dbPath: string = DEFAULT_DB_PATH) {
        mkdirSync(dirname(dbPath), { recursive: true });
        this.db = new Database(dbPath, { create: true });
        this.db.run("PRAGMA journal_mode = WAL");
        this.db.run("PRAGMA synchronous = NORMAL");
        for (const statement of CACHE_SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean)) {
            this.db.run(statement);
        }
    }

    getEntry(group: string, key: string): Promise<CacheEntry | undefined> {
        const row = this.db
            .query<
                CacheEntry,
                [string, string]
            >(
                `SELECT cache_group, cache_key, storage_kind, inline_value, file_path,
                        byte_size, checksum, created_at, expires_at, last_accessed
                 FROM cache_entries
                 WHERE cache_group = ? AND cache_key = ?`,
            )
            .get(group, key);

        return Promise.resolve(row ?? undefined);
    }

    upsertEntry(entry: CacheEntry): Promise<void> {
        this.db.run(
            `INSERT INTO cache_entries (
                cache_group, cache_key, storage_kind, inline_value, file_path,
                byte_size, checksum, created_at, expires_at, last_accessed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(cache_group, cache_key) DO UPDATE SET
                storage_kind = excluded.storage_kind,
                inline_value = excluded.inline_value,
                file_path = excluded.file_path,
                byte_size = excluded.byte_size,
                checksum = excluded.checksum,
                created_at = excluded.created_at,
                expires_at = excluded.expires_at,
                last_accessed = excluded.last_accessed`,
            [
                entry.cache_group,
                entry.cache_key,
                entry.storage_kind,
                entry.inline_value,
                entry.file_path,
                entry.byte_size,
                entry.checksum,
                entry.created_at,
                entry.expires_at,
                entry.last_accessed,
            ],
        );
        return Promise.resolve();
    }

    deleteEntry(group: string, key: string): Promise<void> {
        this.db.run(
            `DELETE FROM cache_entries WHERE cache_group = ? AND cache_key = ?`,
            [group, key],
        );
        return Promise.resolve();
    }

    touchEntry(
        group: string,
        key: string,
        lastAccessed: number,
        expiresAt: number | null,
    ): Promise<void> {
        this.db.run(
            `UPDATE cache_entries
             SET last_accessed = ?, expires_at = ?
             WHERE cache_group = ? AND cache_key = ?`,
            [lastAccessed, expiresAt, group, key],
        );
        return Promise.resolve();
    }

}
