# Usage

## Install

Install devi from this repo (or your published package). React and TanStack Query are **peers** for the adapter subpaths:

```bash
npm install react @tanstack/react-query
```

## Package entry points

| Import | Use when |
|--------|----------|
| `devi` / `devi/core` | Framework-free — workers, `createDevi`, direct `DeviOps` |
| `devi/react` | React app — `<DeviProvider>`, context helpers (`get`, `set`, …) |
| `devi/react-query` | TanStack Query — `read`, `deviQueryFn`, `useLocalFirstQuery` |

## Core (`devi/core`)

No React required. Create an ops instance and call it directly:

```ts
import { createDevi } from "devi/core";

const ops = createDevi("web");

await ops.set("user:1", {
  key: "user:1",
  value: JSON.stringify({ name: "Ada" }),
  lastAccessed: Date.now(),
  metadata: {},
});

const entry = await ops.get("user:1");
```

CLI example: `bun usage/core.ts`

Run the dev server: `bun run usage` → http://localhost:8080/

## React (`devi/react`)

Wrap your app once. Context helpers throw if used outside the provider:

```tsx
import { DeviProvider, get, set, useDevi } from "devi/react";

function App() {
  return (
    <DeviProvider>
      <Dashboard />
    </DeviProvider>
  );
}

function Dashboard() {
  const ops = useDevi(); // or get/set from "devi/react"
  // ...
}
```

Browser example: `bun usage/server.ts` → http://localhost:8080/react

## TanStack Query (`devi/react-query`)

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
import { DeviProvider } from "devi/react";
import { deviQueryFn, read } from "devi/react-query";

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
import { useLocalFirstQuery } from "devi/react-query";

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

| File | Run |
|------|-----|
| `usage/core.ts` | `bun run usage` → `/` (browser) |
| `usage/react.tsx` | `bun run usage` → `/react` |
| `usage/react-query.tsx` | `bun run usage` → `/react-query` |

## Further reading

- [Prefetching & streaming research](./docs/prefetch-and-streaming-research.md)
- [SQLite reference implementation](./docs/sqlite-reference-implementation-guide.md)
