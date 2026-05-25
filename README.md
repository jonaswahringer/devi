# devi

**On-device cache for local-first TypeScript apps.** devi persists data where your app runs — browser (localStorage, IndexedDB, OPFS/SQLite), native mobile (Expo), or server (Bun/SQLite) — so the UI can paint from disk before the network answers.

---

## What is this library?

devi is a **T0 storage layer**: durable read/write for entities you want available offline or on repeat visits. It hides platform details (KV stores, SQLite, blob files) behind one `ICache` interface with groups, TTL, and retention options.

It is **not** a data-fetching framework. It does not replace HTTP clients, GraphQL, or tRPC. It holds bytes on device; something else decides when to fetch and how to show loading state.

---

## Who is this for?

Teams building **React / React Native / full-stack TypeScript** apps that already use (or plan to use) **[TanStack Query](https://tanstack.com/query)** for server state and want:

- Instant first paint from last session’s data
- Write-through persistence after successful API responses
- One cache API across web, mobile, and server runtimes

If you only need in-memory request deduplication, Query alone is enough. devi matters when **reload survival** and **platform-specific storage** are requirements.

---

## Which apps benefit?

| App type | Why devi helps |
|----------|----------------|
| **Dashboards & feeds** | Lists and detail views feel loaded immediately; background refresh updates in place |
| **SaaS with heavy rereads** | Settings, projects, docs — same data across sessions without cold starts |
| **Mobile / flaky networks** | SQLite or IndexedDB-backed cache when connectivity is intermittent |
| **T3 / Next.js / Expo monorepos** | Shared persistence story beside tRPC + Query |
| **Offline-capable tools** | Drafts, queues, cached reference data on device |

Less relevant for purely static sites, one-shot forms, or apps where every screen must always show live server data with no stale tolerance.

---

## TanStack Query integration

Recommended split:

| Layer | Tool | Role |
|-------|------|------|
| Orchestration | `@tanstack/react-query` | Fetch, dedup, `staleTime`, mutations, hydration |
| T0 storage | **devi** | Durable local copy; seed `placeholderData`; write-through on success |

Query owns the request lifecycle. devi owns what survives a tab close or app restart. Use **`read()`** from devi to seed `placeholderData`, **`cache.set`** after a successful `queryFn`, and **`isPlaceholderData` / `isRefetching`** in the UI for honesty about freshness.

Full setup, code, and anti-patterns: **[USAGE.md](./USAGE.md)**.

---

## How devi differs from TanStack DB and other options

| Approach | What it optimizes | vs devi |
|----------|-------------------|---------|
| **[TanStack Query](https://tanstack.com/query)** alone | In-memory server-state, refetch rules | Complements devi — use both; optional `persistQueryClient` is a separate, Query-shaped persistence path |
| **[TanStack DB](https://tanstack.com/db)** | Normalized collections, live queries, sync engines, client SQL | Broader local-first **database + sync** stack; devi is a thinner **cache adapter** under Query, not a replacement for Electric/PGlite-style sync |
| **SWR + custom `provider`** | Stale-while-revalidate with a persisted `Map` | Same UX idea; devi adds multi-runtime storage (OPFS SQLite, Expo, Bun) and a explicit FE contract |
| **`persistQueryClient`** | Dehydrate entire Query cache to localStorage | Good for session restore; devi gives **per-key** control, TTL/LRU on SQLite, and large payloads via blob stores |
| **Raw `localStorage` / IndexedDB** | DIY persistence | devi standardizes groups, options, and platform picks via `CacheFactory` |

**Rule of thumb:** choose **TanStack DB** when you need client-side SQL, live relational queries, or a sync engine as the product core. Choose **devi + Query** when you have a normal REST/tRPC API and want **fast cached reads** with minimal new concepts.

---

## Status & docs

- **Usage & examples:** [USAGE.md](./USAGE.md), `examples/`
- **Prefetch, SWR, streaming research:** [docs/prefetch-and-streaming-research.md](./docs/prefetch-and-streaming-research.md)
- **SQLite implementation guide:** [docs/sqlite-reference-implementation-guide.md](./docs/sqlite-reference-implementation-guide.md)

**Supported today:** Chromium-based browsers; server (Bun); mobile via Expo (in progress). Safari/Firefox not targeted initially.

Streaming cache type: planned.

---

wahringer – oss
