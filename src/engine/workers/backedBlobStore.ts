import type { BlobStore } from "../../defs/blob";
import type { WorkerPool } from "./pool";
import type { BlobDeletePayload, BlobReadPayload, BlobWritePayload } from "./protocol";

/** `BlobStore` that delegates file I/O to the platform cache worker thread. */
export class WorkerBackedBlobStore implements BlobStore {

    constructor(
        private readonly pool: WorkerPool,
        private readonly workerId: string,
    ) {}

    read(relativePath: string): Promise<Uint8Array | undefined> {
        return this.pool.send(this.workerId, "blobRead", {
            relativePath,
        } satisfies BlobReadPayload) as Promise<Uint8Array | undefined>;
    }

    write(relativePath: string, data: Uint8Array): Promise<void> {
        return this.pool.send(this.workerId, "blobWrite", {
            relativePath,
            data,
        } satisfies BlobWritePayload) as Promise<void>;
    }

    delete(relativePath: string): Promise<void> {
        return this.pool.send(this.workerId, "blobDelete", {
            relativePath,
        } satisfies BlobDeletePayload) as Promise<void>;
    }

}
