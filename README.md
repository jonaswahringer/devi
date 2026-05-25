# devi — on-device cache (T0 storage)

**devi** is a persistence layer for fast, local-first UIs. It is meant to be used **in conjunction with [TanStack Query](https://tanstack.com/query)** (`@tanstack/react-query`): Query orchestrates server state (fetch, dedup, staleness, mutations); **devi** holds durable on-device data (SQLite, IndexedDB, localStorage, OPFS, Expo, etc.).

| Layer | Package / tool | Responsibility |
|-------|----------------|----------------|
| **Orchestration** | `@tanstack/react-query` | `useQuery`, cache keys, background refetch, hydration, invalidation |
| **T0 storage** | **devi** | Read/write entities on device before and after network |

Do not call `fetch` + `devi.get` independently in every component — use Query as the single lifecycle owner and devi as read-through / write-through storage.

## TanStack Query integration

Install Query in your app (devi does not bundle it):

```bash
npm install @tanstack/react-query
```

Typical pattern: show cached data immediately, revalidate from the API, persist fresh results back to devi.

```ts
import { useQuery } from '@tanstack/react-query';
import { read, CacheFactory } from 'devi-cache';
import { api } from './api';

const cache = CacheFactory.create<Post>('async', platform);

// Orchestrator owns the lifecycle; devi is T0 storage
useQuery({
  queryKey: ['post', id],
  placeholderData: () => read(cache, `post:${id}`),
  queryFn: async () => {
    const fresh = await api.getPost(id);
    await cache.set(`post:${id}`, fresh);
    return fresh;
  },
});
```

Use **`isPlaceholderData`** and **`isRefetching`** in the UI so users see cached content while a background refresh runs. See [docs/prefetch-and-streaming-research.md](./docs/prefetch-and-streaming-research.md) for SWR, hydration, and prefetch patterns.

## devi API

Cache instance (`ICache` from `CacheFactory.create`):

```ts
cache.set(key, value, options)
cache.get(key, options)      // options.refreshTtl slides disk TTL / LRU (SQLite backends)
cache.delete(key)
```

TanStack Query helper (from `devi-cache`):

```ts
import { read } from 'devi-cache';

read(cache, key, options?)
```

## Streaming

```ts
// TODO
```

## Supported

- browsers (mobile/desktop)
  - chromium
  - ~~safari~~
  - ~~firefox~~
- devices with filesystem access (native / OPFS / Expo)

## Docs

- [Prefetching & streaming research](./docs/prefetch-and-streaming-research.md)
- [SQLite reference implementation](./docs/sqlite-reference-implementation-guide.md)

---

wahringer – oss
