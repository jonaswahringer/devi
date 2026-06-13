/**
 * @devi/react — DeviProvider + context helpers.
 *
 * Dev server: bun run usage → http://localhost:8080/react
 */
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { DeviProvider, get, set, useDevi } from "@devi/react";

function CachePanel() {
  const ops = useDevi();
  const [value, setValue] = useState<string>("(loading…)");

  useEffect(() => {
    void (async () => {
      await set("demo:key", {
        key: "demo:key",
        value: JSON.stringify({ updatedAt: Date.now() }),
        lastAccessed: Date.now(),
        metadata: {},
      });

      const entry = await get("demo:key");
      setValue(entry?.value ? String(entry.value) : "(empty)");
      console.log("[@devi/react] ops instance", ops);
    })();
  }, [ops]);

  return (
    <section>
      <h2>Context helpers</h2>
      <p>
        Value from <code>get("demo:key")</code>: {value}
      </p>
    </section>
  );
}

function App() {
  return (
    <DeviProvider>
      <CachePanel />
    </DeviProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
