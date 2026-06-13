"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { deviQueryFn, read } from "./queryFn";
import type {
  DeviFetchContext,
  DeviFetchResult,
  DeviQueryOptions,
} from "./storage";

/** Matches TanStack Query's internal guard — query data must not be a function. */
type NonFunctionGuard<T> = T extends Function ? never : T;

type LocalFirstQueryOptions<T extends NonFunctionGuard<unknown>> =
  DeviQueryOptions<T> &
    Omit<
      UseQueryOptions<T, Error, T, QueryKey>,
      "queryKey" | "queryFn" | "placeholderData"
    >;

/**
 * Local-first `useQuery` — seeds from devi, fetches in the background,
 * and write-throughs fresh data via {@link deviQueryFn}.
 */
export function useLocalFirstQuery<T extends NonFunctionGuard<unknown>>(
  key: string,
  queryKey: QueryKey,
  fetcher: (ctx: DeviFetchContext<T>) => Promise<DeviFetchResult<T>>,
  options?: LocalFirstQueryOptions<T>,
) {
  const { serialize, deserialize, ttl, staleTime, ...queryOptions } =
    options ?? {};
  const storageOptions = { serialize, deserialize, ttl };

  const seed = useQuery<T | undefined>({
    queryKey: ["__devi__", key],
    queryFn: () => read<T>(key, storageOptions),
    staleTime: Infinity,
  });

  const seedValue = seed.data;

  return useQuery({
    ...queryOptions,
    ...(seedValue !== undefined
      ? { placeholderData: seedValue as NonFunctionGuard<T> }
      : {}),
    queryKey,
    enabled: (queryOptions.enabled ?? true) && !seed.isLoading,
    queryFn: deviQueryFn(key, fetcher, storageOptions),
    staleTime: staleTime ?? 30_000,
  });
}
