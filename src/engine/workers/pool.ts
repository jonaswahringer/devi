/**
 * Worker spawn, outbound RPC queue (flush after `ready`), and idempotent response routing.
 */

import type { WorkerAction, WorkerInitPayload } from "./protocol";
import { WorkerRpcQueue } from "./queue";

type PendingCallback = {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
};

type WorkerSession = {
    worker: Worker;
    queue: WorkerRpcQueue;
};

export let workerPool: WorkerPool | null = null;

export class WorkerPool {

    private readonly sessions = new Map<string, WorkerSession>();
    private readonly pending = new Map<string, PendingCallback>();

    static getInstance(): WorkerPool {
        workerPool ??= new WorkerPool();
        return workerPool;
    }

    has(id: string): boolean {
        return this.sessions.has(id);
    }

    /**
     * Spawn (or reuse) a worker by id. `scriptUrl` is the platform entry module.
     * Init is sent immediately; RPC is queued until the worker posts `{ type: "ready" }`.
     */
    spawn(id: string, scriptUrl: string | URL, init?: WorkerInitPayload): Worker {
        const existing = this.sessions.get(id);
        if (existing) {
            return existing.worker;
        }

        const worker = new Worker(typeof scriptUrl === "string" ? scriptUrl : scriptUrl.href, {
            name: id,
        } satisfies Bun.WorkerOptions);

        const queue = new WorkerRpcQueue(worker);
        this.sessions.set(id, { worker, queue });
        this.attachListeners(id, worker, queue);

        queue.sendInit(init ?? {});

        return worker;
    }

    send(id: string, action: WorkerAction, payload?: unknown): Promise<unknown> {
        const session = this.sessions.get(id);
        if (!session) {
            throw new Error(`Worker ${id} not found`);
        }

        return new Promise((resolve, reject) => {
            const requestId = crypto.randomUUID();
            this.pending.set(requestId, { resolve, reject });
            session.queue.sendRpc(requestId, action, payload);
        });
    }

    private attachListeners(id: string, worker: Worker, queue: WorkerRpcQueue) {
        worker.onmessage = (event) => {
            const msg = event.data;

            if (msg?.type === "ready") {
                queue.markReady();
                return;
            }

            if (msg?.type === "error") {
                queue.reset();
                this.rejectAllPending(new Error(msg.error ?? "Worker init failed"));
                console.error(`worker ${id} init failed:`, msg.error);
                return;
            }

            const { requestId, success, data, error } = normalizeRpcResponse(msg);
            const cb = this.pending.get(requestId);
            if (!cb) {
                return;
            }
            this.pending.delete(requestId);
            success ? cb.resolve(data) : cb.reject(new Error(error));
        };

        worker.onerror = (event) => {
            console.error(`worker ${id} error`, event);
        };
    }

    private rejectAllPending(reason: Error) {
        for (const [, cb] of this.pending) {
            cb.reject(reason);
        }
        this.pending.clear();
    }

    terminate(id: string) {
        const session = this.sessions.get(id);
        if (!session) {
            throw new Error(`Worker ${id} not found`);
        }
        session.worker.terminate();
        this.sessions.delete(id);
        this.rejectAllPending(new Error(`Worker ${id} terminated`));
    }

}

function normalizeRpcResponse(msg: Record<string, unknown>): {
    requestId: string;
    success: boolean;
    data?: unknown;
    error?: string;
} {
    return {
        requestId: String(msg.id ?? msg.requestId),
        success: Boolean(msg.success),
        data: msg.data,
        error: msg.error != null ? String(msg.error) : undefined,
    };
}
