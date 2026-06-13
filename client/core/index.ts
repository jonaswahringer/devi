import { DeviDispatcher } from "./dispatcher";
import type { DeviOps } from "./ops";
import type { DeviAction, DeviValue, DeviWorkerType } from "./protocol";

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

function invoke(
  dispatcher: Pick<DeviDispatcher, "call">,
  action: DeviAction,
  key: string,
  value?: DeviValue,
): Promise<unknown> {
  return dispatcher.call({
    action,
    payload: value ?? { key, lastAccessed: Date.now(), metadata: {} },
    resolved: false,
  });
}

export function bindOps(dispatcher: Pick<DeviDispatcher, "call">): DeviOps {
  return {
    get: (key) => invoke(dispatcher, "get", key) as Promise<DeviValue | undefined>,
    set: (key, value) =>
      invoke(dispatcher, "set", key, { ...value, key }) as Promise<void>,
    delete: (key) => invoke(dispatcher, "delete", key) as Promise<void>,
    clear: () => invoke(dispatcher, "clear", "") as Promise<void>,
    size: () => invoke(dispatcher, "size", "") as Promise<number>,
    keys: () => invoke(dispatcher, "keys", "") as Promise<string[]>,
  };
}

export function createDevi(type: DeviWorkerType): DeviOps {
  return bindOps(new DeviDispatcher(type));
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

/** Seed TanStack Query `placeholderData` from durable devi storage. */
export function read(key: string) {
  return requireDeviOps().get(key);
}

export type { DeviOps } from "./ops";
export type { DeviValue, DeviWorkerType } from "./protocol";

