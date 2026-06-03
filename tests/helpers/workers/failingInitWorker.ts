import { worker } from "../../../src/engine/workers/global";

worker.onmessage = (event: MessageEvent) => {
    if (event.data?.type === "init") {
        worker.postMessage({ type: "error", error: "init failed" });
        return;
    }

    const { id } = event.data;
    worker.postMessage({ id, success: true, data: undefined });
};
