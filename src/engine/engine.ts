import { Options } from "../defs/options";
import { CacheFactory } from "../generate";
import { PlatformDetails } from "../platforms/types";

export class Engine {

    static init(_options: Options): Promise<void> {
        
        const platform: PlatformDetails = { runtime: 'server' };
        const cache = CacheFactory.create('sync', platform);
        
        return Promise.resolve();
    }



}