import type { CacheEntry } from "../../src/defs/entry";
import { INLINE_THRESHOLD_BYTES } from "../../src/defs/constants";

export function sampleEntry(overrides: Partial<CacheEntry> = {}): CacheEntry {
    const now = Date.now();
    return {
        cache_group: "default",
        cache_key: "test-key",
        storage_kind: "inline",
        inline_value: new Uint8Array([1, 2, 3]),
        file_path: null,
        byte_size: 3,
        checksum: null,
        created_at: now,
        expires_at: null,
        last_accessed: now,
        ...overrides,
    };
}

export function smallBytes(length = 16): Uint8Array {
    const data = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        data[i] = i % 256;
    }
    return data;
}

export function largeBytes(length = INLINE_THRESHOLD_BYTES + 1): Uint8Array {
    const data = new Uint8Array(length);
    data.fill(0xab);
    return data;
}
