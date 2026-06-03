import { afterEach, describe, expect, test } from "bun:test";
import { sampleEntry, smallBytes } from "../helpers/fixtures";
import { createWorkerHarness, type WorkerHarness } from "../helpers/workerHarness";

describe("WorkerPool stress", () => {
    let harness: WorkerHarness;

    afterEach(async () => {
        await harness?.cleanup();
    });

    test("100 concurrent RPC calls all settle", async () => {
        harness = await createWorkerHarness();
        const entry = sampleEntry({ cache_key: "stress" });
        await harness.sqlite.upsertEntry(entry);

        const tasks: Promise<unknown>[] = [];

        for (let i = 0; i < 40; i++) {
            tasks.push(
                harness.pool.send(harness.workerId, "getEntry", {
                    group: "default",
                    key: "stress",
                }),
            );
        }

        for (let i = 0; i < 30; i++) {
            tasks.push(
                harness.pool.send(harness.workerId, "upsertEntry", {
                    entry: sampleEntry({
                        cache_key: `stress-${i}`,
                        inline_value: new Uint8Array([i]),
                    }),
                }),
            );
        }

        for (let i = 0; i < 30; i++) {
            tasks.push(
                harness.pool.send(harness.workerId, "blobWrite", {
                    relativePath: `stress/${i}.bin`,
                    data: smallBytes(8),
                }),
            );
        }

        const results = await Promise.allSettled(tasks);
        const rejected = results.filter((r) => r.status === "rejected");
        expect(rejected).toHaveLength(0);
    });
});
