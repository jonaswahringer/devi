import { worker } from "./global";
import type { WorkerAction, WorkerInitPayload } from "./protocol";

/**
 * Install the cache worker message loop (init handshake + action RPC).
 * Used by platform worker entry scripts only.
 */
export function installWorkerRpc(
    handleAction: (action: WorkerAction, payload: unknown) => unknown | Promise<unknown>,
    onInit?: (msg: WorkerInitPayload) => void | Promise<void>,
): void {
    worker.onmessage = async (event: MessageEvent) => {
        const msg = event.data;

        if (msg?.type === "init") {
            try {
                await onInit?.(msg);
                worker.postMessage({ type: "ready" });
            } catch (error) {
                worker.postMessage({ type: "error", error: String(error) });
            }
            return;
        }

        const { id, action, payload } = msg;
        try {
            const data = await handleAction(action, payload);
            worker.postMessage({ id, success: true, data });
        } catch (error) {
            worker.postMessage({ id, success: false, error: String(error) });
        }
    };
}
