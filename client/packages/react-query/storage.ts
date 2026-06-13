/*****
 * 
 * 
 * 
 * NEEDS REVIEW & REVISION
 * 
 * 
 */

import type { DeviValue } from "../../core/protocol";

export type DeviQueryOptions<T> = {
  serialize?: (data: T) => string;
  deserialize?: (raw: string) => T;
  ttl?: number;
};

export type DeviFetchContext<T> = {
  cached: T | undefined;
  etag: string | undefined;
  entry: DeviValue | undefined;
};

/** Return `{ notModified: true }` on HTTP 304 to reuse the devi copy. */
export type DeviFetchResult<T> =
  | T
  | { notModified: true }
  | { data: T; etag?: string; metadata?: Record<string, unknown> };

export const defaultSerialize = JSON.stringify;

export const defaultDeserialize = JSON.parse;

export function resolveEntry<T>(
  entry: DeviValue | undefined,
  options?: DeviQueryOptions<T>,
): T | undefined {
  if (!entry?.value || typeof entry.value !== "string") {
    return undefined;
  }
  if (entry.expiresAt != null && entry.expiresAt <= Date.now()) {
    return undefined;
  }
  const deserialize = options?.deserialize ?? defaultDeserialize;
  return deserialize(entry.value) as T;
}

export function toDeviValue<T>(
  key: string,
  data: T,
  options?: DeviQueryOptions<T> & {
    etag?: string;
    metadata?: Record<string, unknown>;
  },
): DeviValue {
  const serialize = options?.serialize ?? defaultSerialize;
  return {
    key,
    value: serialize(data),
    lastAccessed: Date.now(),
    expiresAt: options?.ttl ? Date.now() + options.ttl : undefined,
    metadata: {
      ...options?.metadata,
      ...(options?.etag ? { etag: options.etag } : {}),
    },
  };
}

export function unwrapFetchResult<T>(
  result: DeviFetchResult<T>,
):
  | { notModified: true }
  | { data: T; etag?: string; metadata?: Record<string, unknown> } {
  if (
    typeof result === "object" &&
    result !== null &&
    "notModified" in result &&
    result.notModified === true
  ) {
    return { notModified: true };
  }

  if (typeof result === "object" && result !== null && "data" in result) {
    const shaped = result as {
      data: T;
      etag?: string;
      metadata?: Record<string, unknown>;
    };
    return {
      data: shaped.data,
      etag: shaped.etag,
      metadata: shaped.metadata,
    };
  }

  return { data: result as T };
}
