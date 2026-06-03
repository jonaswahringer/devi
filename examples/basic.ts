import { CacheFactory } from "../src/generate";

console.log("Creating test sqlite cache...");

const cache = CacheFactory.create(
    "async",
    { runtime: "server" },
    "sqlite",
    "static",
);

console.log("Cache created successfully");

await cache.set("test", "value");

const testVal = await cache.get("test");
console.log("Test:", testVal);
