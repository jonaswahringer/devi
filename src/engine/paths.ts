/** Default SQLite database file (Bun server). */
export const DEFAULT_SERVER_DB_PATH = `${process.env.HOME}/.cache/devi/sqlite/cache.sqlite`;

/** Default blob store root (Bun server filesystem). */
export const DEFAULT_SERVER_BLOB_ROOT = `${process.env.HOME}/.cache/devi/blobs`;

/** `{group}/{hashPrefix}/{hash}` — stable relative path for blob-store files. */
export function blobRelativePath(group: string, key: string): string {
    const hash = hashCacheKey(key);
    return `${group}/${hash.slice(0, 2)}/${hash}`;
}

function hashCacheKey(key: string): string {
    let h = 0;
    for (let i = 0; i < key.length; i++) {
        h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(16).padStart(8, "0");
}
