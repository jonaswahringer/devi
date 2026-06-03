import { afterEach, describe, expect, test } from "bun:test";
import { INLINE_THRESHOLD_BYTES } from "../../src/defs/constants";
import { createTestServerCache, type TestServerCache } from "../helpers/createTestServerCache";
import { largeBytes } from "../helpers/fixtures";

describe("CacheFactory-style integration", () => {
    let setup: TestServerCache;

    afterEach(async () => {
        await setup?.cleanup();
    });

    test("string round-trip", async () => {
        setup = await createTestServerCache();
        await setup.cache.set("test", "value");
        const value = await setup.cache.get("test");
        expect(value).toBe("value");
    });

    test("large Uint8Array round-trip via blob store", async () => {
        setup = await createTestServerCache();
        const large = largeBytes(INLINE_THRESHOLD_BYTES + 1);
        await setup.cache.set("big", large);
        const read = await setup.cache.get("big");

        expect(read).toBeInstanceOf(Uint8Array);
        expect((read as Uint8Array).byteLength).toBe(large.byteLength);
        expect((read as Uint8Array)).toEqual(large);
    });

    test("delete removes cached value", async () => {
        setup = await createTestServerCache();
        await setup.cache.set("gone", "value");
        await setup.cache.delete("gone");
        expect(await setup.cache.get("gone")).toBeUndefined();
    });
});
