import { DEFAULT_GROUP, ICache } from "../../defs/cache";
import { Options } from "../../defs/options";

export class FileSystemCache<T> implements ICache<T> {
    
    group: string;

    constructor(options?: Options) {
        this.group = options?.group || DEFAULT_GROUP;
    }
    
    get(key: string, options?: Options): Promise<T | undefined> {
        throw new Error("Method not implemented.");
    }
    
    getThenRefresh(key: string, options?: Options): Promise<T | undefined> {
        throw new Error("Method not implemented.");
    }
    
    set(key: string, value: T, options?: Options): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    delete(key: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
}
