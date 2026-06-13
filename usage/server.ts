import index from "./index.html";
import reactPage from "./react.html";
import reactQueryPage from "./react-query.html";

const server = Bun.serve({
  development: true,
  port: 8080,
  routes: {
    "/": index,
    "/react": reactPage,
    "/react-query": reactQueryPage,
  },
});

console.log(`Usage examples → http://localhost:${server.port}`);
