# Usage

## Install

devi is consumed from this repo (or your published package). TanStack Query is a **peer** — install it in the app:

```bash
npm install @tanstack/react-query
```

## Create a cache

```ts
import { CacheFactory } from 'devi-cache';

const cache = CacheFactory.create<Post>('async', platform, 'default', {
  ttl: 5 * 60 * 1000,
  retentionPolicy: 'persistent',
});
```

Types: `sync` (localStorage / sessionStorage / server SQLite), `async` (IndexedDB / OPFS on web). See `CacheFactory` in `src/generate.ts` for runtime routing.

## Cache API (`ICache`)

```ts
await cache.set(key, value, options?)
await cache.get(key, options?)       // pass { refreshTtl: true } to slide TTL / LRU (SQLite)
await cache.delete(key)
```

## TanStack Query integration {#tanstack-query-integration}

### Canonical `useQuery` pattern

```ts
import { useQuery } from '@tanstack/react-query';
import { read, CacheFactory } from 'devi-cache';
import { api } from './api';

const cache = CacheFactory.create<Post>('async', platform);

useQuery({
  queryKey: ['post', id],
  placeholderData: () => read(cache, `post:${id}`), // devi persists; Query only borrows for first paint
  queryFn: async () => {
    const fresh = await api.getPost(id);
    await cache.set(`post:${id}`, fresh);          // write-through to devi
    return fresh;                                  // Query cache gets real data
  },
});
```

### Who owns what (not “persisting placeholderData”)

| Store | Role |
|-------|------|
| **devi** | Durable local copy (survives reload) — `cache.set`, SQLite, etc. |
| **`placeholderData`** | Bridge into Query for one fetch cycle — `read(cache, key)` |
| **Query cache after `queryFn`** | In-memory server truth until stale / invalidated |

- **Persist on disk** → devi.
- **Borrow for UI while fetching** → Query `placeholderData` + `read()`.
- **Authoritative after fetch** → `queryFn` result in the Query cache.

TanStack Query does **not** persist `placeholderData`. Only devi (or SSR `dehydrate` / deliberate `setQueryData`) should hold data across reloads.

**Anti-pattern:** using `initialData` or `persistQueryClient` for stale partial disk snapshots that should stay provisional until the API returns.

### `read()` helper

```ts
import { read } from 'devi-cache';

read(cache, key, options?)
```

Use in `placeholderData`, or anywhere you need a typed `cache.get` for Query seeding.

### UI flags

- **`isPlaceholderData`** — showing devi snapshot while fetch runs
- **`isRefetching`** — background refresh; keep content on screen

### Reusable hook sketch

```ts
import { useQuery, type QueryKey } from '@tanstack/react-query';
import { read, type ICache } from 'devi-cache';

function useLocalFirstQuery<T>(
  cache: ICache<T>,
  deviKey: string,
  queryKey: QueryKey,
  fetcher: () => Promise<T>,
) {
  return useQuery({
    queryKey,
    placeholderData: () => read(cache, deviKey),
    queryFn: async () => {
      const fresh = await fetcher();
      await cache.set(deviKey, fresh);
      return fresh;
    },
    staleTime: 30_000,
  });
}
```

## Examples

- `examples/basic.ts` — create cache, `set` / `get`
- Run dev server: `bun --port=8080 --hot examples/server.ts`

More integrations (Next.js RSC, streaming) will be added under `examples/`.

## Further reading

- [Prefetching & streaming research](./docs/prefetch-and-streaming-research.md)
- [SQLite reference implementation](./docs/sqlite-reference-implementation-guide.md)
