import { CacheValue } from "../defs/cache";

const STRING_TAG = 0;
const BINARY_TAG = 1;

export function toBytes(value: CacheValue): Uint8Array {
    const payload = typeof value === "string"
        ? new TextEncoder().encode(value)
        : value;
    const out = new Uint8Array(1 + payload.byteLength);
    out[0] = typeof value === "string" ? STRING_TAG : BINARY_TAG;
    out.set(payload, 1);
    return out;
}

export function fromBytes(bytes: Uint8Array): CacheValue {
    const payload = bytes.subarray(1);
    return bytes[0] === STRING_TAG
        ? new TextDecoder().decode(payload)
        : payload;
}