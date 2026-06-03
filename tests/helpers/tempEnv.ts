import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

export type TempCacheEnv = {
    dir: string;
    dbPath: string;
    blobRoot: string;
    cleanup: () => Promise<void>;
};

export async function createTempCacheEnv(prefix = "devi-test-"): Promise<TempCacheEnv> {
    const dir = await mkdtemp(join(tmpdir(), prefix));
    const dbPath = join(dir, "cache.sqlite");
    const blobRoot = join(dir, "blobs");

    return {
        dir,
        dbPath,
        blobRoot,
        cleanup: () => rm(dir, { recursive: true, force: true }),
    };
}
