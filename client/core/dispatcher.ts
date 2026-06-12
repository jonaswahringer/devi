import { WorkerPool } from "./pool";
import { DeviRequest, DeviWorkerType } from "./protocol";

export class DeviDispatcher {

    private type: DeviWorkerType;
    private readonly pool: WorkerPool = new WorkerPool();
    private strategy: 'round-robin' | 'sticky' = 'round-robin';

    constructor(type: DeviWorkerType) {
        this.type = type;
        this.pool.spawn("worker-1", this.type);
        this.pool.spawn("worker-2", this.type);
    }

    async call(request: DeviRequest): Promise<unknown> {
        const workerId = this.pickWorker();
        return this.pool.send(workerId, request);
    }

    private pickWorker() {
        // TODO: Implement worker selection strategy
        console.log(`Skipping worker selection ${this.strategy} strategy, fallback to worker-1`);
        return "worker-1";
    }

}
