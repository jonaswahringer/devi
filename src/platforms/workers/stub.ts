/**
 * Worker RPC stub for platforms not yet implemented (web OPFS, Expo, …).
 */
import { installWorkerRpc, type WorkerAction } from "../../engine/workers";

async function handleAction(_action: WorkerAction, _payload: unknown): Promise<unknown> {
    throw new Error("Cache worker is not implemented for this platform yet.");
}

installWorkerRpc(handleAction);
