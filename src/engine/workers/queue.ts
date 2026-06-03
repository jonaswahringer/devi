import type { WorkerAction } from "./protocol";

type RpcMessage = {
    id: string;
    action: WorkerAction;
    payload?: unknown;
};

/**
 * Queues outbound RPC until the worker signals `ready`.
 * `markReady` is idempotent — safe if `ready` is posted more than once.
 */
export class WorkerRpcQueue {

    private ready = false;
    private readonly queued: RpcMessage[] = [];

    constructor(private readonly worker: Worker) {}

    sendInit(init: Record<string, unknown>): void {
        this.worker.postMessage({ type: "init", ...init });
    }

    sendRpc(id: string, action: WorkerAction, payload?: unknown): void {
        const message: RpcMessage = { id, action, payload };
        if (this.ready) {
            this.worker.postMessage(message);
            return;
        }
        this.queued.push(message);
    }

    markReady(): void {
        if (this.ready) {
            return;
        }
        this.ready = true;
        for (const message of this.queued) {
            this.worker.postMessage(message);
        }
        this.queued.length = 0;
    }

    reset(): void {
        this.ready = false;
        this.queued.length = 0;
    }

}
