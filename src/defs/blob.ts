/** Relative-path blob I/O for cache entries with `storage_kind: "file"`. */
export interface BlobStore {
    read(relativePath: string): Promise<Uint8Array | undefined>;
    write(relativePath: string, data: Uint8Array): Promise<void>;
    delete(relativePath: string): Promise<void>;
}
