import { Options } from "../../defs/options";

/**
 * OPFS `read`, `write`, and `delete` for cache blobs addressed by relative path.
 * Not implemented yet.
 */
export class OpfsBlobStore {

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
