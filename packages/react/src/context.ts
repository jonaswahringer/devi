import type { DeviOps, DeviValue } from "@devi/core";

let registeredOps: DeviOps | null = null;

/** @internal Called by DeviProvider to register the active cache instance. */
export function registerDeviOps(ops: DeviOps | null): void {
  registeredOps = ops;
}

export function requireDeviOps(): DeviOps {
  if (!registeredOps) {
    throw new Error("Devi not initialized. Wrap your app in <DeviProvider>.");
  }
  return registeredOps;
}

export function get(key: string) {
  return requireDeviOps().get(key);
}

export function set(key: string, value: DeviValue) {
  return requireDeviOps().set(key, value);
}

export function del(key: string) {
  return requireDeviOps().delete(key);
}

export function clear() {
  return requireDeviOps().clear();
}

export function size() {
  return requireDeviOps().size();
}

export function keys() {
  return requireDeviOps().keys();
}
