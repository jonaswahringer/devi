import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(root, "..");

const pages = ["vanilla", "react", "react-query"];

/** Map /vanilla → /vanilla/index.html (Vite SPA fallback only serves root index.html). */
function mpaCleanUrls(): Plugin {
  return {
    name: "mpa-clean-urls",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [pathname, search = ""] = (req.url ?? "").split("?");
        const name = pathname.slice(1);
        if (pages.includes(name)) {
          req.url = `/${name}/index.html${search ? `?${search}` : ""}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  root,
  appType: "mpa",
  plugins: [react(), mpaCleanUrls()],
  server: {
    port: 8080,
    fs: { allow: [repoRoot] },
  },
  optimizeDeps: {
    exclude: ["@devi/core", "@devi/react", "@devi/react-query"],
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(root, "index.html"),
        vanilla: path.resolve(root, "vanilla/index.html"),
        react: path.resolve(root, "react/index.html"),
        reactQuery: path.resolve(root, "react-query/index.html"),
      },
    },
  },
});
