import { Options } from "../../defs/options";

/**
 * Parameterized SQL for the server cache database via `bun:sqlite`.
 * Targets `cache_entries` and TTL/LRU indexes. Not implemented yet.
 */
export class BunSqliteStore {

    constructor(_options?: Options) {}

    run(_sql: string, _params?: unknown[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    get<T = unknown>(_sql: string, _params?: unknown[]): Promise<T | undefined> {
        throw new Error("Method not implemented.");
    }

    all<T = unknown>(_sql: string, _params?: unknown[]): Promise<T[]> {
        throw new Error("Method not implemented.");
    }

}
