import { WebWorkerHost } from "./platforms/web";
import { DeviRequest, DeviWorker, DeviWorkerType } from "./protocol";

export class WorkerPool {

    private readonly workers: Map<string, DeviWorker> = new Map();
    private readonly pending: Map<string, {
        resolve: (value: unknown) => void;
        reject: (reason?: any) => void;
    }> = new Map();

    /**
     * Spawn a worker and initialize the event listener.
     * @param id - The ID of the worker.
     * @param scriptUrl - The URL of the worker script.
     * @returns The worker instance.
     */
    spawn(id: string, type: DeviWorkerType): void {
        const worker = new WebWorkerHost().spawn(id);
        this.workers.set(id, worker);
        this._attachListener(worker);
    }

    private _attachListener(worker: DeviWorker): void {
        worker.onmessage = (data) => {
            const { id, success, payload, error } = data;
            const request = this.pending.get(id);
            if (!request) return;
            this.pending.delete(id);
            success ? request.resolve(payload) : request.reject(new Error(error));
        }
    }

    /**
     * Get a worker URL based on its type.
     */
    getWorkerUrl(type: DeviWorkerType): URL {
        switch (type) {
            case 'web':
                return new URL('../platforms/web.ts', import.meta.url);
            case 'mobile':
                return new URL('../platforms/mobile.ts', import.meta.url);
            default:
                throw new Error(`Unknown worker type: ${type}`);
        }
    }

    /**
     * Get a worker by its ID.
     * @param id - The ID of the worker.
     * @returns The worker instance.
     */
    _getWorker(id: string): DeviWorker {
        const worker = this.workers.get(id);
        if (!worker) {
            throw new Error(`Worker for id ${id} not found`);
        }
        return worker;
    }

    /**
     * Send a request to a worker.
     * @param workerId - The ID of the worker.
     * @param request - The request to send.
     * @returns A promise that resolves to the response.
     */
    send(workerId: string, request: DeviRequest): Promise<unknown> {
        return new Promise((resolve, reject) => {
            request.id = crypto.randomUUID();
            this.pending.set(request.id, {resolve, reject});
            this._send(workerId, request);
        });
    }

    private _send(workerId: string, request: DeviRequest): void {
        const worker = this._getWorker(workerId);
        if (request.payload.value instanceof Uint8Array 
            && request.payload.value.length > 50 * 1024 * 1024) {
            worker.postMessage({ request }, [request.payload.value]);
        } else {
            worker.postMessage({ request });
        }
    }

}
