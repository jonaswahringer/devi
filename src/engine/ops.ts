import { BlobStore } from "../defs/blob";
import { CacheValue } from "../defs/cache";
import { INLINE_THRESHOLD_BYTES } from "../defs/constants";
import { Options } from "../defs/options";
import { CacheStore } from "../defs/store";
import { blobRelativePath } from "./paths";
import { fromBytes, toBytes } from "./seder";
import { expiresAt, isExpired, resolveGroup, resolveTtl } from "./utils";

/** get/set/delete with inline SQLite BLOBs or file-backed blob store above the size threshold. */
export class CacheOps {

    constructor(
        private readonly store: CacheStore,
        private readonly blobs: BlobStore,
        private readonly instanceGroup: string,
        private readonly inlineThresholdBytes: number = INLINE_THRESHOLD_BYTES,
    ) {}

    async get(key: string, options?: Options): Promise<CacheValue | undefined> {
        const group = resolveGroup(options?.group ?? this.instanceGroup);
        const entry = await this.store.getEntry(group, key);
        if (!entry) {
            return undefined;
        }

        const now = Date.now();
        if (isExpired(entry, now)) {
            await this.deleteEntryAndBlob(group, key, entry.file_path);
            return undefined;
        }

        if (options?.refreshTtl) {
            const ttl = resolveTtl(options?.group ?? this.instanceGroup);
            await this.store.touchEntry(group, key, now, expiresAt(now, ttl));
        }

        if (entry.storage_kind === "file") {
            if (!entry.file_path) {
                return undefined;
            }
            const bytes = await this.blobs.read(entry.file_path);
            return bytes ? fromBytes(bytes) : undefined;
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

        const existing = await this.store.getEntry(group, key);
        if (existing?.storage_kind === "file" && existing.file_path) {
            await this.blobs.delete(existing.file_path);
        }

        if (bytes.byteLength > this.inlineThresholdBytes) {
            const filePath = blobRelativePath(group, key);
            await this.blobs.write(filePath, bytes);
            await this.store.upsertEntry({
                cache_group: group,
                cache_key: key,
                storage_kind: "file",
                inline_value: null,
                file_path: filePath,
                byte_size: bytes.byteLength,
                checksum: null,
                created_at: now,
                expires_at: expiresAt(now, ttl),
                last_accessed: now,
            });
            return;
        }

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
        const entry = await this.store.getEntry(group, key);
        await this.deleteEntryAndBlob(group, key, entry?.file_path ?? null);
    }

    private async deleteEntryAndBlob(
        group: string,
        key: string,
        filePath: string | null | undefined,
    ): Promise<void> {
        if (filePath) {
            await this.blobs.delete(filePath);
        }
        await this.store.deleteEntry(group, key);
    }

}
