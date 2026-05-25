import { Options } from "../../defs/options";

/**
 * `read`, `write`, and `delete` for cache blobs via `Bun.write` / Node fs.
 * Not implemented yet.
 */
export class BunBlobStore {

    constructor(_options?: Options) {}

    read(_relativePath: string): Promise<Uint8Array | undefined> {
        throw new Error("Method not implemented.");
    }

    write(_relativePath: string, _data: Uint8Array): Promise<void> {
        throw new Error("Method not implemented.");
    }

    delete(_relativePath: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
