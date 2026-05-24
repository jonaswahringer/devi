import index from "./index.html";

const server = Bun.serve({
  development: true,
  routes: {
    "/": index,
  },
});

console.log("Open http://localhost:"+server.port);
