import index from "./index.html";
import vanilla from "./vanilla/index.html";
import react from "./react/index.html";
import reactQuery from "./react-query/index.html";

const server = Bun.serve({
  development: true,
  port: 8080,
  routes: {
    "/": index,
    "/vanilla": vanilla,
    "/react": react,
    "/react-query": reactQuery,
  },
});

console.log(`Usage examples → http://localhost:${server.port}`);
