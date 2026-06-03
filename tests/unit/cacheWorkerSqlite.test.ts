import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import * as sqlite from "../../src/platforms/server/cacheWorkerSqlite";
import { sampleEntry } from "../helpers/fixtures";
import { createTempCacheEnv, type TempCacheEnv } from "../helpers/tempEnv";

describe("cacheWorkerSqlite", () => {
    let env: TempCacheEnv;

    beforeEach(async () => {
        env = await createTempCacheEnv();
        sqlite.init(env.dbPath);
    });

    afterEach(async () => {
        await env.cleanup();
    });

    test("getEntry returns undefined on miss", () => {
        const result = sqlite.handle("getEntry", { group: "default", key: "missing" });
        expect(result).toBeUndefined();
    });

    test("upsertEntry and getEntry round-trip", () => {
        const entry = sampleEntry({ cache_key: "round-trip" });
        sqlite.handle("upsertEntry", { entry });
        const result = sqlite.handle("getEntry", {
            group: entry.cache_group,
            key: entry.cache_key,
        }) as typeof entry;

        expect(result).toBeDefined();
        expect(result.cache_key).toBe("round-trip");
        expect(result.storage_kind).toBe("inline");
        expect(result.inline_value).toEqual(entry.inline_value);
    });

    test("upsertEntry twice updates the same row", () => {
        const entry = sampleEntry({ cache_key: "upsert", inline_value: new Uint8Array([1]) });
        sqlite.handle("upsertEntry", { entry });
        sqlite.handle("upsertEntry", {
            entry: { ...entry, inline_value: new Uint8Array([9]), byte_size: 1 },
        });

        const result = sqlite.handle("getEntry", {
            group: entry.cache_group,
            key: entry.cache_key,
        }) as typeof entry;

        expect(result.inline_value).toEqual(new Uint8Array([9]));
    });

    test("deleteEntry removes the row", () => {
        const entry = sampleEntry({ cache_key: "delete-me" });
        sqlite.handle("upsertEntry", { entry });
        sqlite.handle("deleteEntry", { group: entry.cache_group, key: entry.cache_key });

        const result = sqlite.handle("getEntry", {
            group: entry.cache_group,
            key: entry.cache_key,
        });
        expect(result).toBeUndefined();
    });

    test("touchEntry updates last_accessed and expires_at", () => {
        const entry = sampleEntry({ cache_key: "touch" });
        sqlite.handle("upsertEntry", { entry });

        const touchedAt = Date.now() + 60_000;
        const expiresAt = Date.now() + 120_000;
        sqlite.handle("touchEntry", {
            group: entry.cache_group,
            key: entry.cache_key,
            lastAccessed: touchedAt,
            expiresAt,
        });

        const result = sqlite.handle("getEntry", {
            group: entry.cache_group,
            key: entry.cache_key,
        }) as typeof entry;

        expect(result.last_accessed).toBe(touchedAt);
        expect(result.expires_at).toBe(expiresAt);
    });

    test("init twice on the same path preserves existing rows", () => {
        const entry = sampleEntry({ cache_key: "persist" });
        sqlite.handle("upsertEntry", { entry });
        sqlite.init(env.dbPath);

        const result = sqlite.handle("getEntry", {
            group: entry.cache_group,
            key: entry.cache_key,
        });
        expect(result).toBeDefined();
    });

    test("normalizes inline_value to Uint8Array", () => {
        const entry = sampleEntry({
            cache_key: "normalize",
            inline_value: new Uint8Array([4, 5, 6]),
        });
        sqlite.handle("upsertEntry", { entry });

        const result = sqlite.handle("getEntry", {
            group: entry.cache_group,
            key: entry.cache_key,
        }) as typeof entry;

        expect(result.inline_value).toBeInstanceOf(Uint8Array);
        expect(result.inline_value).toEqual(new Uint8Array([4, 5, 6]));
    });

    test("rejects non-SQLite actions", () => {
        expect(() => sqlite.handle("blobRead", { relativePath: "x" })).toThrow(
            "Not a SQLite action: blobRead",
        );
    });
});

describe("cacheWorkerSqlite before init", () => {
    test("handle before init throws", () => {
        sqlite.resetForTests();
        expect(() =>
            sqlite.handle("getEntry", { group: "default", key: "k" }),
        ).toThrow("SQLite store not initialized");
    });
});
