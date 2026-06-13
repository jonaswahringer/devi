import { DeviDispatcher } from "./dispatcher";
import type { DeviOps } from "./ops";
import type { DeviAction, DeviValue, DeviWorkerType } from "./protocol";

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

export type { DeviOps } from "./ops";
export type { DeviValue, DeviWorkerType } from "./protocol";

