import { CacheType, ICache } from "./defs/cache";
import { Driver } from "./defs/drivers";
import { InvalidOptionsError } from "./defs/errors";
import { getDefaultOptions } from "./defs/groups";
import { Options } from "./defs/options";
import { createPlatformCache } from "./platforms/registry";
import type { PlatformDetails } from "./platforms/types";

export class CacheFactory {

    static create(
        type: CacheType,
        platform: PlatformDetails,
        driver: Driver,
        group?: string,
        options?: Options,
    ): ICache {

        CacheFactory.validate(type, platform, driver);

        const group_options = getDefaultOptions(group ?? "default");
        const merged = options
            ? { ...group_options, ...options }
            : group_options;

        if (merged.ttl != null && merged.ttl < 0) {
            throw new InvalidOptionsError("TTL must be equal to or greater than 0");
        }

        switch (type) {
            case "sync":
            case "async":
                return createPlatformCache(platform, merged);
            case "stream":
                throw new Error("Not implemented");
            default:
                throw new InvalidOptionsError(`Invalid cache type: ${type}`);
        }
    }

    private static validate(type: CacheType, platform: PlatformDetails, driver: Driver) {
        if (driver !== "sqlite") {
            throw new InvalidOptionsError(
                `Invalid driver for ${platform.runtime} cache: ${driver}. Only "sqlite" is supported.`,
            );
        }

        switch (type) {
            case "sync":
            case "async":
                return;
            case "stream":
                throw new Error("Not implemented");
            default:
                throw new InvalidOptionsError(`Invalid cache type: ${type}`);
        }
    }

}
