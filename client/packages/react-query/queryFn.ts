
/*****
 * 
 * 
 * 
 * NEEDS REVIEW & REVISION
 * 
 * 
 */




import { get, requireDeviOps, set } from "../react/context";
import type {
  DeviFetchContext,
  DeviFetchResult,
  DeviQueryOptions,
} from "./storage";
import { resolveEntry, toDeviValue, unwrapFetchResult } from "./storage";

/** Seed TanStack Query `placeholderData` from durable devi storage. */
export async function read<T>(
  key: string,
  options?: DeviQueryOptions<T>,
): Promise<T | undefined> {
  const entry = await requireDeviOps().get(key);
  return resolveEntry(entry, options);
}

/**
 * Wrap a fetcher as a TanStack Query `queryFn` with devi read/write-through.
 *
 * - Loads the devi entry before calling your fetcher (for 304 / ETag flows).
 * - Persists fresh results after a successful fetch.
 * - Skips `set` when the fetcher returns `{ notModified: true }`.
 *
 * @example Simple fetch (no conditional request)
 * ```ts
 * useQuery({
 *   queryKey: ['post', id],
 *   placeholderData: () => read(`post:${id}`),
 *   queryFn: deviQueryFn(`post:${id}`, () => api.getPost(id)),
 * });
 * ```
 *
 * @example With ETag / 304
 * ```ts
 * deviQueryFn(`post:${id}`, async ({ cached, etag }) => {
 *   const res = await fetch(`/api/posts/${id}`, {
 *     headers: etag ? { 'If-None-Match': etag } : {},
 *   });
 *   if (res.status === 304) return { notModified: true };
 *   return {
 *     data: await res.json(),
 *     etag: res.headers.get('etag') ?? undefined,
 *   };
 * });
 * ```
 */
export function deviQueryFn<T>(
  key: string,
  fetcher: (ctx: DeviFetchContext<T>) => Promise<DeviFetchResult<T>>,
  options?: DeviQueryOptions<T>,
): () => Promise<T> {
  return async () => {
    const entry = await get(key);
    const ctx: DeviFetchContext<T> = {
      entry,
      cached: resolveEntry(entry, options),
      etag: entry?.metadata?.etag as string | undefined,
    };

    const outcome = unwrapFetchResult(await fetcher(ctx));

    if ("notModified" in outcome) {
      if (ctx.cached === undefined) {
        throw new Error(
          `Devi: received notModified for "${key}" but no cached value exists`,
        );
      }
      return ctx.cached;
    }

    const { data, etag, metadata } = outcome;
    await set(
      key,
      toDeviValue(key, data, { ...options, etag, metadata }),
    );
    return data;
  };
}

/** Convenience wrapper when you don't need the devi fetch context. */
export function deviQueryFnSimple<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: DeviQueryOptions<T>,
): () => Promise<T> {
  return deviQueryFn(key, () => fetcher(), options);
}

/**
 * Conditional `fetch` helper — sends `If-None-Match` when an ETag is stored in devi.
 * Return `{ notModified: true }` on 304 so devi skips rewriting the entry.
 */
export async function fetchWithEtag<T>(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  ctx: DeviFetchContext<T>,
  parse: (response: Response) => Promise<T>,
): Promise<DeviFetchResult<T>> {
  const headers = new Headers(init?.headers);
  if (ctx.etag) {
    headers.set("If-None-Match", ctx.etag);
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 304) {
    return { notModified: true };
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${String(input)}`);
  }

  return {
    data: await parse(response),
    etag: response.headers.get("etag") ?? undefined,
  };
}
