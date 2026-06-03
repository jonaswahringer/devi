import { CacheEntry } from "../defs/entry";
import { Options, TTL } from "../defs/options";


const DEFAULT_TTL = 5 * TTL.MINUTE;

export function resolveGroup(instanceGroup: string, options?: Options): string {
    return options?.group ?? instanceGroup;
}

export function resolveTtl(instanceGroup: string, options?: Options): number {
    return options?.ttl ?? DEFAULT_TTL;
}

export function expiresAt(now: number, ttl: number): number | null {
    return ttl === TTL.NO_EXPIRATION ? null : now + ttl;
}

export function isExpired(entry: CacheEntry, now: number): boolean {
    return entry.expires_at != null && entry.expires_at <= now;
}
