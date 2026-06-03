/**
 * Server cache worker entry: SQLite metadata + filesystem blobs.
 */
import { installWorkerRpc, type WorkerAction } from "../../engine/workers";
import * as blob from "./cacheWorkerBlob";
import * as sqlite from "./cacheWorkerSqlite";

async function handleAction(action: WorkerAction, payload: unknown): Promise<unknown> {
    if (action === "blobRead" || action === "blobWrite" || action === "blobDelete") {
        return blob.handle(action, payload);
    }
    return sqlite.handle(action, payload);
}

installWorkerRpc(handleAction, async (msg) => {
    if (msg.dbPath) {
        sqlite.init(msg.dbPath);
    }
    if (msg.blobRoot) {
        blob.init(msg.blobRoot);
    }
});
