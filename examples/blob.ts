import { INLINE_THRESHOLD_BYTES } from "../src/defs/constants";
import { CacheFactory } from "../src/generate";

const cache = CacheFactory.create("async", { runtime: "server" }, "sqlite");

const large = new Uint8Array(INLINE_THRESHOLD_BYTES + 1);
large.fill(0xab);

await cache.set("big", large);
const read = await cache.get("big");

console.log("blob round-trip:", read instanceof Uint8Array && read.byteLength === large.byteLength);
