import { CacheValue } from "../defs/cache";
import { Options } from "../defs/options";
import { CacheStore } from "../defs/store";
import { fromBytes, toBytes } from "./seder";
import { expiresAt, isExpired, resolveGroup, resolveTtl } from "./utils";

/** Inline-only get/set/delete shared by SQLite- and Dexie-backed caches. */
export class CacheOps {

    constructor(
        private readonly store: CacheStore,
        private readonly instanceGroup: string,
    ) {}

    async get(key: string, options?: Options): Promise<CacheValue | undefined> {
        const group = resolveGroup(options?.group ?? this.instanceGroup);
        const entry = await this.store.getEntry(group, key);
        if (!entry) {
            return undefined;
        }

        const now = Date.now();
        if (isExpired(entry, now)) {
            await this.store.deleteEntry(group, key);
            return undefined;
        }

        if (options?.refreshTtl) {
            const ttl = resolveTtl(options?.group ?? this.instanceGroup);
            await this.store.touchEntry(group, key, now, expiresAt(now, ttl));
        }

        if (entry.storage_kind === "file") {
            throw new Error("File-backed entries require a blob store");
        }
        if (entry.inline_value == null) {
            return undefined;
        }

        return fromBytes(entry.inline_value);
    }

    async set(key: string, value: CacheValue, options?: Options): Promise<void> {
        const group = resolveGroup(options?.group ?? this.instanceGroup);
        const bytes = toBytes(value);
        const now = Date.now();
        const ttl = resolveTtl(options?.group ?? this.instanceGroup);

        await this.store.upsertEntry({
            cache_group: group,
            cache_key: key,
            storage_kind: "inline",
            inline_value: bytes,
            file_path: null,
            byte_size: bytes.byteLength,
            checksum: null,
            created_at: now,
            expires_at: expiresAt(now, ttl),
            last_accessed: now,
        });
    }

    async delete(key: string, options?: Options): Promise<void> {
        const group = resolveGroup(options?.group ?? this.instanceGroup);
        await this.store.deleteEntry(group, key);
    }

}
