import type { CacheEntry } from "../../defs/entry";

export type WorkerInitPayload = {
    /** SQLite database file (server). */
    dbPath?: string;
    /** Root directory for file-backed cache blobs. */
    blobRoot?: string;
};

export type WorkerRequest = {
    id: string;
    action: WorkerAction;
    payload?: unknown;
};

export type WorkerResponse = {
    id: string;
    success: boolean;
    data?: unknown;
    error?: string;
};

export type WorkerAction =
    | "getEntry"
    | "upsertEntry"
    | "deleteEntry"
    | "touchEntry"
    | "blobRead"
    | "blobWrite"
    | "blobDelete";

export type GetEntryPayload = { group: string; key: string };
export type UpsertEntryPayload = { entry: CacheEntry };
export type DeleteEntryPayload = { group: string; key: string };
export type TouchEntryPayload = {
    group: string;
    key: string;
    lastAccessed: number;
    expiresAt: number | null;
};

export type BlobReadPayload = { relativePath: string };
export type BlobWritePayload = { relativePath: string; data: Uint8Array };
export type BlobDeletePayload = { relativePath: string };
