import { worker } from "../../../src/engine/workers/global";

worker.onmessage = (event: MessageEvent) => {
    if (event.data?.type === "init") {
        worker.postMessage({ type: "ready" });
        return;
    }

    const { id } = event.data;
    worker.postMessage({ id, success: true, data: "first" });
    worker.postMessage({ id, success: true, data: "duplicate" });
};
