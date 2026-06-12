import { DeviWorker, DeviWorkerHost, DeviWorkerReply } from "../core/protocol";

export class WebWorkerHost implements DeviWorkerHost {

    spawn(id: string): DeviWorker {
        
        const worker = new Worker(new URL('./web/worker.ts', import.meta.url), { name: id});

        let handler: ((data: DeviWorkerReply) => void) | null = null;
        
        worker.onmessage = (event: MessageEvent<DeviWorkerReply>) => {
            handler?.(event.data);
        };

        return {
            postMessage: (message, transfer) => {
                worker.postMessage(message, transfer ?? []);
            },
            terminate: () => {
                worker.terminate();
            },
            set onmessage(h: (data: DeviWorkerReply) => void) {
                handler = h;
            }
        }

        
    }

}
