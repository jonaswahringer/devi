import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { CACHE_SCHEMA_SQL, type CacheEntry } from "../../defs/entry";
import type {
    DeleteEntryPayload,
    GetEntryPayload,
    TouchEntryPayload,
    UpsertEntryPayload,
    WorkerAction,
} from "../../engine/workers";

let db: Database | null = null;

/**
 * Open the cache database (create file and schema only when missing).
 * Idempotent: an existing database is opened, not recreated or overwritten;
 * `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` leave existing rows intact.
 */
export function init(dbPath: string): void {
    mkdirSync(dirname(dbPath), { recursive: true });
    db = new Database(dbPath, { create: true });
    db.run("PRAGMA journal_mode = WAL");
    db.run("PRAGMA synchronous = NORMAL");
    for (const statement of CACHE_SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean)) {
        db.run(statement);
    }
}

/** @internal Close the database handle (test isolation). */
export function resetForTests(): void {
    db?.close();
    db = null;
}

function normalizeEntry(row: CacheEntry): CacheEntry {
    if (row.inline_value != null && !(row.inline_value instanceof Uint8Array)) {
        row.inline_value = new Uint8Array(row.inline_value as ArrayLike<number>);
    }
    return row;
}

export function handle(action: WorkerAction, payload: unknown): unknown {
    if (!db) {
        throw new Error("SQLite store not initialized");
    }

    switch (action) {
        case "getEntry": {
            const { group, key } = payload as GetEntryPayload;
            const row = db
                .query<CacheEntry, [string, string]>(
                    `SELECT cache_group, cache_key, storage_kind, inline_value, file_path,
                            byte_size, checksum, created_at, expires_at, last_accessed
                     FROM cache_entries
                     WHERE cache_group = ? AND cache_key = ?`,
                )
                .get(group, key);
            return row ? normalizeEntry(row) : undefined;
        }
        case "upsertEntry": {
            const { entry } = payload as UpsertEntryPayload;
            db.run(
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
            return undefined;
        }
        case "deleteEntry": {
            const { group, key } = payload as DeleteEntryPayload;
            db.run(
                `DELETE FROM cache_entries WHERE cache_group = ? AND cache_key = ?`,
                [group, key],
            );
            return undefined;
        }
        case "touchEntry": {
            const { group, key, lastAccessed, expiresAt } = payload as TouchEntryPayload;
            db.run(
                `UPDATE cache_entries
                 SET last_accessed = ?, expires_at = ?
                 WHERE cache_group = ? AND cache_key = ?`,
                [lastAccessed, expiresAt, group, key],
            );
            return undefined;
        }
        default:
            throw new Error(`Not a SQLite action: ${action}`);
    }
}
