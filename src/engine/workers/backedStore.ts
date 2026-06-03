import type { CacheEntry } from "../../defs/entry";
import type { CacheStore } from "../../defs/store";
import type { WorkerPool } from "./pool";
import type {
    DeleteEntryPayload,
    GetEntryPayload,
    TouchEntryPayload,
    UpsertEntryPayload,
} from "./protocol";

/** `CacheStore` that delegates SQLite I/O to a platform worker thread. */
export class WorkerBackedStore implements CacheStore {

    constructor(
        private readonly pool: WorkerPool,
        private readonly workerId: string,
    ) {}

    getEntry(group: string, key: string): Promise<CacheEntry | undefined> {
        return this.pool.send(this.workerId, "getEntry", { group, key } satisfies GetEntryPayload) as Promise<
            CacheEntry | undefined
        >;
    }

    upsertEntry(entry: CacheEntry): Promise<void> {
        return this.pool.send(this.workerId, "upsertEntry", { entry } satisfies UpsertEntryPayload) as Promise<void>;
    }

    deleteEntry(group: string, key: string): Promise<void> {
        return this.pool.send(this.workerId, "deleteEntry", { group, key } satisfies DeleteEntryPayload) as Promise<void>;
    }

    touchEntry(
        group: string,
        key: string,
        lastAccessed: number,
        expiresAt: number | null,
    ): Promise<void> {
        return this.pool.send(this.workerId, "touchEntry", {
            group,
            key,
            lastAccessed,
            expiresAt,
        } satisfies TouchEntryPayload) as Promise<void>;
    }

}
