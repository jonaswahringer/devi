import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import * as blob from "../../src/platforms/server/cacheWorkerBlob";
import { smallBytes } from "../helpers/fixtures";
import { createTempCacheEnv, type TempCacheEnv } from "../helpers/tempEnv";

describe("cacheWorkerBlob", () => {
    let env: TempCacheEnv;

    beforeEach(async () => {
        env = await createTempCacheEnv();
        blob.init(env.blobRoot);
    });

    afterEach(async () => {
        await env.cleanup();
    });

    test("write and read round-trip bytes", async () => {
        const data = smallBytes(32);
        await blob.handle("blobWrite", { relativePath: "a/b.bin", data });
        const result = (await blob.handle("blobRead", {
            relativePath: "a/b.bin",
        })) as Uint8Array;

        expect(result).toEqual(data);
    });

    test("read missing file returns undefined", async () => {
        const result = await blob.handle("blobRead", { relativePath: "missing.bin" });
        expect(result).toBeUndefined();
    });

    test("delete missing file does not throw", async () => {
        await expect(
            blob.handle("blobDelete", { relativePath: "missing.bin" }),
        ).resolves.toBeUndefined();
    });

    test("delete existing file removes it", async () => {
        const data = smallBytes(8);
        await blob.handle("blobWrite", { relativePath: "remove.bin", data });
        await blob.handle("blobDelete", { relativePath: "remove.bin" });

        const result = await blob.handle("blobRead", { relativePath: "remove.bin" });
        expect(result).toBeUndefined();
    });

    test("rejects path traversal", async () => {
        await expect(
            blob.handle("blobRead", { relativePath: "../escape.bin" }),
        ).rejects.toThrow("Invalid blob path");
    });

    test("creates nested directories on write", async () => {
        const data = smallBytes(4);
        await blob.handle("blobWrite", { relativePath: "nested/deep/file.bin", data });
        const result = (await blob.handle("blobRead", {
            relativePath: "nested/deep/file.bin",
        })) as Uint8Array;

        expect(result).toEqual(data);
    });

    test("rejects non-blob actions", async () => {
        await expect(
            blob.handle("getEntry", { group: "default", key: "k" }),
        ).rejects.toThrow("Not a blob action: getEntry");
    });
});

describe("cacheWorkerBlob before init", () => {
    test("read before init throws", async () => {
        blob.resetForTests();
        await expect(
            blob.handle("blobRead", { relativePath: "x.bin" }),
        ).rejects.toThrow("Blob store not initialized");
    });
});
