/**
 * TanStack Query integration — local-first reads with devi write-through.
 *
 * Run the dev server: bun usage/server.ts
 * Open: http://localhost:<port>/react-query
 */
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { DeviProvider } from "devi/react";
import {
  deviQueryFn,
  read,
  useLocalFirstQuery,
} from "devi/react-query";

type Post = { id: number; title: string; body: string };

const POST_ID = 1;
const DEVI_KEY = `post:${POST_ID}`;

async function fetchPost(): Promise<Post> {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${POST_ID}`,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Post>;
}

/** Manual pattern: compose `read` + `deviQueryFn` yourself. */
function ManualPost() {
  const { data, isPlaceholderData, isFetching } = useQuery({
    queryKey: ["post-manual", POST_ID],
    placeholderData: () => read<Post>(DEVI_KEY),
    queryFn: deviQueryFn(DEVI_KEY, fetchPost),
    staleTime: 30_000,
  });

  return (
    <section>
      <h2>Manual useQuery + read + deviQueryFn</h2>
      <p>
        {isPlaceholderData ? "Showing devi snapshot" : "Showing query data"}
        {isFetching ? " (refreshing…)" : ""}
      </p>
      <pre>{data ? JSON.stringify(data, null, 2) : "Loading…"}</pre>
    </section>
  );
}

/** Convenience hook — seeds from devi, fetches, write-throughs automatically. */
function LocalFirstPost() {
  const { data, isPlaceholderData, isFetching } = useLocalFirstQuery<Post>(
    DEVI_KEY,
    ["post-local-first", POST_ID],
    fetchPost,
    { staleTime: 30_000 },
  );

  return (
    <section>
      <h2>useLocalFirstQuery</h2>
      <p>
        {isPlaceholderData ? "Showing devi snapshot" : "Showing query data"}
        {isFetching ? " (refreshing…)" : ""}
      </p>
      <pre>{data ? JSON.stringify(data, null, 2) : "Loading…"}</pre>
    </section>
  );
}

function App() {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <DeviProvider>
        <main style={{ fontFamily: "system-ui", padding: "1.5rem" }}>
          <h1>devi/react-query</h1>
          <ManualPost />
          <LocalFirstPost />
        </main>
      </DeviProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
