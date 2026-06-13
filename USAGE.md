# Usage

## Install

Install only the packages you need:

```bash
# Core only — no React
npm install @devi/core

# React adapter
npm install @devi/react

# TanStack Query integration (pulls in @devi/react + @devi/core)
npm install @devi/react-query
```

Each package declares its own peers. **`@devi/core` has none.**

| Package | Peers |
|---------|-------|
| `@devi/core` | — |
| `@devi/react` | `react >=18` |
| `@devi/react-query` | `react >=18`, `@tanstack/react-query ^5` |

## Core (`@devi/core`)

No React required. Create an ops instance and call it directly:

```ts
import { createDevi } from "@devi/core";

const ops = createDevi("web");

await ops.set("user:1", {
  key: "user:1",
  value: JSON.stringify({ name: "Ada" }),
  lastAccessed: Date.now(),
  metadata: {},
});

const entry = await ops.get("user:1");
```

Browser example: `bun run usage` → http://localhost:8080/vanilla

## React (`@devi/react`)

Wrap your app once. Context helpers throw if used outside the provider:

```tsx
import { DeviProvider, get, set, useDevi } from "@devi/react";

function App() {
  return (
    <DeviProvider>
      <Dashboard />
    </DeviProvider>
  );
}

function Dashboard() {
  const ops = useDevi(); // or get/set from "@devi/react"
  // ...
}
```

Browser example: `bun run usage` → http://localhost:8080/react

## TanStack Query (`@devi/react-query`)

Requires `<DeviProvider>` above your query tree (same as `QueryClientProvider`).

### Who owns what

| Store | Role |
|-------|------|
| **devi** | Durable local copy (survives reload) — written by `deviQueryFn` |
| **`placeholderData`** | Bridge into Query for first paint — seeded via `read()` |
| **Query cache after `queryFn`** | In-memory server truth until stale / invalidated |

TanStack Query does **not** persist `placeholderData`. Only devi should hold data across reloads.

### Manual `useQuery` pattern

```tsx
import { useQuery } from "@tanstack/react-query";
import { DeviProvider } from "@devi/react";
import { deviQueryFn, read } from "@devi/react-query";

const key = `post:${id}`;

useQuery({
  queryKey: ["post", id],
  placeholderData: () => read<Post>(key),
  queryFn: deviQueryFn(key, () => api.getPost(id)),
  staleTime: 30_000,
});
```

### `useLocalFirstQuery`

Same flow in one hook — seeds from devi, fetches in the background, write-throughs on success:

```tsx
import { useLocalFirstQuery } from "@devi/react-query";

const { data, isPlaceholderData, isFetching } = useLocalFirstQuery<Post>(
  `post:${id}`,
  ["post", id],
  () => api.getPost(id),
);
```

### UI flags

- **`isPlaceholderData`** — showing devi snapshot while fetch runs
- **`isFetching`** — background refresh; keep content on screen

Browser example: `bun run usage` → http://localhost:8080/react-query

## Examples

| Folder | Run |
|--------|-----|
| `usage/vanilla/` | `bun run usage` → `/vanilla` |
| `usage/react/` | `bun run usage` → `/react` |
| `usage/react-query/` | `bun run usage` → `/react-query` |

## Further reading

- [Prefetching & streaming research](./docs/prefetch-and-streaming-research.md)
- [SQLite reference implementation](./docs/sqlite-reference-implementation-guide.md)
