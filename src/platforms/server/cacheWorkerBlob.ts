import { mkdirSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type {
    BlobDeletePayload,
    BlobReadPayload,
    BlobWritePayload,
    WorkerAction,
} from "../../engine/workers";

let blobRoot: string | null = null;

/**
 * Set the blob store root (create the directory only when missing).
 * Idempotent: existing files under the root are not removed or overwritten by init.
 */
export function init(blobRootPath: string): void {
    mkdirSync(blobRootPath, { recursive: true });
    blobRoot = blobRootPath;
}

function resolveSafePath(relativePath: string): string {
    if (!blobRoot) {
        throw new Error("Blob store not initialized");
    }
    const root = resolve(blobRoot);
    const full = resolve(root, relativePath);
    if (full !== root && !full.startsWith(`${root}/`)) {
        throw new Error("Invalid blob path");
    }
    return full;
}

export async function handle(action: WorkerAction, payload: unknown): Promise<unknown> {
    switch (action) {
        case "blobRead": {
            const { relativePath } = payload as BlobReadPayload;
            try {
                const data = await readFile(resolveSafePath(relativePath));
                return new Uint8Array(data);
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                    return undefined;
                }
                throw error;
            }
        }
        case "blobWrite": {
            const { relativePath, data } = payload as BlobWritePayload;
            const path = resolveSafePath(relativePath);
            await mkdir(dirname(path), { recursive: true });
            await writeFile(path, data);
            return undefined;
        }
        case "blobDelete": {
            const { relativePath } = payload as BlobDeletePayload;
            try {
                await unlink(resolveSafePath(relativePath));
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                    throw error;
                }
            }
            return undefined;
        }
        default:
            throw new Error(`Not a blob action: ${action}`);
    }
}
