import { describe, expect, test } from "bun:test";
import { blobRelativePath } from "../../src/engine/paths";

describe("blobRelativePath", () => {
    test("returns a stable path for the same key", () => {
        const first = blobRelativePath("default", "my-key");
        const second = blobRelativePath("default", "my-key");
        expect(first).toBe(second);
    });

    test("returns different paths for different keys", () => {
        const a = blobRelativePath("default", "key-a");
        const b = blobRelativePath("default", "key-b");
        expect(a).not.toBe(b);
    });

    test("includes the group prefix", () => {
        const path = blobRelativePath("sessions", "key");
        expect(path.startsWith("sessions/")).toBe(true);
    });
});
