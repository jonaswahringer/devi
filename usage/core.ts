/**
 * Core-only usage — no React, no TanStack Query.
 *
 * Open via the dev server: bun usage/server.ts → http://localhost:8080/
 */
import { createDevi } from "devi/core";

const ops = createDevi("web");

await ops.set("greeting", {
  key: "greeting",
  value: JSON.stringify({ message: "hello from devi" }),
  lastAccessed: Date.now(),
  metadata: {},
});

const entry = await ops.get("greeting");
const parsed = entry?.value ? JSON.parse(entry.value as string) : null;

console.log("[devi/core] stored:", parsed);
console.log("[devi/core] keys:", await ops.keys());
console.log("[devi/core] size:", await ops.size());

const status = document.getElementById("core-status");
if (status) {
  status.textContent = parsed
    ? `Stored: ${(parsed as { message: string }).message}`
    : "No value returned (worker may still be stubbed)";
}
