import { afterEach, describe, expect, test } from "bun:test";
import { CacheOps } from "../../src/engine/ops";
import { sampleEntry } from "../helpers/fixtures";
import { createWorkerHarness, type WorkerHarness } from "../helpers/workerHarness";

describe("parallel worker operations", () => {
    let harness: WorkerHarness;

    afterEach(async () => {
        await harness?.cleanup();
    });

    test("parallel reads return the same value", async () => {
        harness = await createWorkerHarness();
        const entry = sampleEntry({ cache_key: "parallel-read" });
        await harness.sqlite.upsertEntry(entry);

        const results = await Promise.all(
            Array.from({ length: 20 }, () =>
                harness.sqlite.getEntry("default", "parallel-read"),
            ),
        );

        for (const result of results) {
            expect(result?.cache_key).toBe("parallel-read");
        }
    });

    test("parallel writes to distinct keys all persist", async () => {
        harness = await createWorkerHarness();

        await Promise.all(
            Array.from({ length: 20 }, (_, i) =>
                harness.sqlite.upsertEntry(
                    sampleEntry({
                        cache_key: `key-${i}`,
                        inline_value: new Uint8Array([i]),
                    }),
                ),
            ),
        );

        const checks = await Promise.all(
            Array.from({ length: 20 }, (_, i) =>
                harness.sqlite.getEntry("default", `key-${i}`),
            ),
        );

        for (let i = 0; i < checks.length; i++) {
            expect(checks[i]?.inline_value).toEqual(new Uint8Array([i]));
        }
    });

    test("mixed parallel reads and writes settle without error", async () => {
        harness = await createWorkerHarness();
        const ops = new CacheOps(harness.sqlite, harness.blobs, "default");
        await ops.set("mixed", "seed");

        const tasks = Array.from({ length: 20 }, (_, i) =>
            i % 2 === 0
                ? ops.get("mixed")
                : ops.set(`mixed-${i}`, `value-${i}`),
        );

        await expect(Promise.all(tasks)).resolves.toBeDefined();
    });

    test("parallel sets are dispatched without waiting for each to finish", async () => {
        harness = await createWorkerHarness();
        const ops = new CacheOps(harness.sqlite, harness.blobs, "default");

        const startTimes: number[] = [];
        const tasks = Array.from({ length: 20 }, (_, i) => {
            startTimes.push(performance.now());
            return ops.set(`perf-${i}`, `value-${i}`);
        });

        const dispatchSpreadMs = Math.max(...startTimes) - Math.min(...startTimes);
        expect(dispatchSpreadMs).toBeLessThan(25);

        await Promise.all(tasks);
        const result = await ops.get("perf-19");
        expect(result).toBe("value-19");
    });
});
