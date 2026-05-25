/** Row shape shared by SQLite (`bun:sqlite`) and Dexie (IndexedDB). */
export interface CacheEntry {
    cache_group: string;
    cache_key: string;
    storage_kind: "inline" | "file";
    inline_value: Uint8Array | null;
    file_path: string | null;
    byte_size: number;
    checksum: string | null;
    created_at: number;
    expires_at: number | null;
    last_accessed: number;
}

export const CACHE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS cache_entries (
  cache_group     TEXT    NOT NULL DEFAULT 'default',
  cache_key       TEXT    NOT NULL,
  storage_kind    TEXT    NOT NULL CHECK(storage_kind IN ('inline', 'file')),
  inline_value    BLOB,
  file_path       TEXT,
  byte_size       INTEGER NOT NULL DEFAULT 0,
  checksum        TEXT,
  created_at      INTEGER NOT NULL,
  expires_at      INTEGER,
  last_accessed   INTEGER NOT NULL,
  PRIMARY KEY (cache_group, cache_key)
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at)
  WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cache_lru ON cache_entries(cache_group, last_accessed);
`;
