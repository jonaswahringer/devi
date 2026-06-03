import { describe, expect, test } from "bun:test";
import { WorkerRpcQueue } from "../../src/engine/workers/queue";
import { MockWorker } from "../helpers/mockWorker";

describe("WorkerRpcQueue", () => {
    test("buffers RPC until ready", () => {
        const worker = new MockWorker();
        const queue = new WorkerRpcQueue(worker as unknown as Worker);

        queue.sendRpc("req-1", "getEntry", { group: "g", key: "k" });

        expect(worker.posted).toHaveLength(0);
    });

    test("flushes queued RPC in order on markReady", () => {
        const worker = new MockWorker();
        const queue = new WorkerRpcQueue(worker as unknown as Worker);

        queue.sendRpc("req-1", "getEntry", { group: "g", key: "a" });
        queue.sendRpc("req-2", "getEntry", { group: "g", key: "b" });
        queue.markReady();

        expect(worker.posted).toEqual([
            { id: "req-1", action: "getEntry", payload: { group: "g", key: "a" } },
            { id: "req-2", action: "getEntry", payload: { group: "g", key: "b" } },
        ]);
    });

    test("posts RPC immediately when already ready", () => {
        const worker = new MockWorker();
        const queue = new WorkerRpcQueue(worker as unknown as Worker);

        queue.markReady();
        queue.sendRpc("req-1", "blobRead", { relativePath: "a/b" });

        expect(worker.posted).toEqual([
            { id: "req-1", action: "blobRead", payload: { relativePath: "a/b" } },
        ]);
    });

    test("double markReady is idempotent", () => {
        const worker = new MockWorker();
        const queue = new WorkerRpcQueue(worker as unknown as Worker);

        queue.sendRpc("req-1", "getEntry", { group: "g", key: "k" });
        queue.markReady();
        queue.markReady();

        expect(worker.posted).toHaveLength(1);
    });

    test("reset clears queue and drops ready flag", () => {
        const worker = new MockWorker();
        const queue = new WorkerRpcQueue(worker as unknown as Worker);

        queue.sendRpc("req-1", "getEntry", { group: "g", key: "k" });
        queue.reset();
        queue.markReady();

        expect(worker.posted).toHaveLength(0);

        queue.sendRpc("req-2", "getEntry", { group: "g", key: "k2" });
        queue.markReady();

        expect(worker.posted).toEqual([
            { id: "req-2", action: "getEntry", payload: { group: "g", key: "k2" } },
        ]);
    });

    test("sendInit posts init message", () => {
        const worker = new MockWorker();
        const queue = new WorkerRpcQueue(worker as unknown as Worker);

        queue.sendInit({ dbPath: "/tmp/db.sqlite", blobRoot: "/tmp/blobs" });

        expect(worker.posted).toEqual([
            { type: "init", dbPath: "/tmp/db.sqlite", blobRoot: "/tmp/blobs" },
        ]);
    });
});
