# SQLite + OPFS Cache — Implementation Guide

How to implement devi's SQLite-backed cache on **web** and **mobile**.

Each platform cache is two stores:

- **SQLite store** — `cache_entries` rows (keys, TTL, LRU, metadata)
- **Blob store** — file-backed payloads when values exceed the inline threshold

```
platforms/
  registry.ts                    # createPlatformCache(platform, options)
  shared/createWorkerStores.ts   # worker-backed sqlite + blobs per runtime
  shared/sqliteCache.ts
  server/cacheWorker.ts          # worker entry
  server/cacheWorkerSqlite.ts    # sqlite handlers (worker thread)
  server/cacheWorkerBlob.ts      # filesystem blob handlers (worker thread)
  web/cacheWorker.ts             # worker entry (stub → OPFS)
  mobile/cacheWorker.ts          # worker entry (stub → Expo)
```

Shared policy (serialization, TTL, eviction) belongs in `engine/`. Platform files only do I/O.

---

## Schema

```sql
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

CREATE INDEX idx_cache_expires ON cache_entries(expires_at)
  WHERE expires_at IS NOT NULL;
CREATE INDEX idx_cache_lru ON cache_entries(cache_group, last_accessed);
```

| `Options` field | Column / behavior |
|-----------------|-------------------|
| `group` | `cache_group` |
| `ttl: 0` | `expires_at = NULL` |
| `ttl: N` | `expires_at = now + N` on set; reset on `get` when `refreshTtl: true` |

---

## Inline vs blob store

On `set`, serialize the value and compare size to `INLINE_THRESHOLD` (default **64 KB**).

| Size | `storage_kind` | Written by |
|------|----------------|------------|
| ≤ threshold | `inline` | SQLite store (`inline_value` BLOB) |
| > threshold | `file` | Blob store; SQLite row holds `file_path` only |

Rule of thumb from [SQLite BLOB benchmarks](https://sqlite.org/intern-v-extern-blob.html): inline below ~100 KB, files above.

Blob path pattern: `{group}/{hash(key)[0:2]}/{hash(key)}.json`

Always commit the SQLite row in the **same transaction** as the blob write decision. On `delete`, remove the row and unlink the file.

---

## Web

### `OpfsSqliteStore`

Parameterized SQL against `cache_entries` via `@sqlite.org/sqlite-wasm` with OPFS VFS.

- Run inside a **Worker** (OPFS sync I/O is worker-only)
- Open with `filename: 'file:cache.sqlite3?vfs=opfs'`
- Requires response headers:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
- One Worker per origin; coordinate multi-tab access with Web Locks if needed

Methods: `run(sql, params)`, `get(sql, params)`, `all(sql, params)`.

On open:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
```

### `OpfsBlobStore`

OPFS read/write/delete for blobs addressed by relative path.

Methods: `read(path)`, `write(path, data)`, `delete(path)`.

Use atomic writes: write `{path}.tmp`, then rename to `{path}`, then upsert the SQLite row.

OPFS is origin-private, quota-bound, and cleared when the user clears site data. Check quota with `navigator.storage.estimate()`.

### `IndexedDbCache`

Composes `OpfsSqliteStore` + `OpfsBlobStore` and implements `ICache`:

1. `set` — serialize → inline or blob → upsert row → evict if over limit
2. `get` — select row; read `inline_value` or delegate to blob store
3. `get` with `options.refreshTtl: true` — after read, update `last_accessed` and `expires_at`
4. `delete` — select `file_path`, delete row, delete blob if present

---

## Mobile

### `ExpoSqliteStore`

Same schema and SQL as web, backed by `expo-sqlite` (`runAsync`, `getFirstAsync`, `getAllAsync`).

- DB file in app sandbox
- Enable WAL in expo-sqlite config (SDK 51+)
- Use transactions for every `set` / `delete`

### `ExpoBlobStore`

Same relative-path API as `OpfsBlobStore`, backed by `expo-file-system`.

- Root: `${FileSystem.cacheDirectory}devi/blobs/`
- OS may purge cache dir under storage pressure; entries must be re-fetchable

### `ExpoCache`

Same `ICache` flow as `IndexedDbCache`, using `ExpoSqliteStore` + `ExpoBlobStore`.

---

## Eviction

Run after `set` or on a timer:

```sql
-- expired
DELETE FROM cache_entries
WHERE expires_at IS NOT NULL AND expires_at <= ?;

-- LRU (per group)
DELETE FROM cache_entries WHERE rowid IN (
  SELECT rowid FROM cache_entries
  WHERE cache_group = ?
  ORDER BY last_accessed ASC
  LIMIT ?
);
```

Delete blob files for removed rows. Periodically sweep orphaned files with no matching row.

---

## References

| Topic | Link |
|-------|------|
| OPFS | https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system |
| SQLite WASM + OPFS | https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system |
| SQLite WASM persistence | https://sqlite.org/wasm/doc/trunk/persistence.md |
| SQLite inline vs external BLOBs | https://sqlite.org/intern-v-extern-blob.html |
| Expo SQLite | https://docs.expo.dev/versions/latest/sdk/sqlite |
