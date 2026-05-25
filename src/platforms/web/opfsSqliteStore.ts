import { Options } from "../../defs/options";

/**
 * Parameterized SQL for the web cache database (`cache_entries`, TTL/LRU indexes).
 * Backend: `@sqlite.org/sqlite-wasm` with OPFS VFS in a Worker. Not implemented yet.
 */
export class OpfsSqliteStore {

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
