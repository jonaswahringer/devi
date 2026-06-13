// src/defs/errors.ts
class InvalidOptionsError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidOptionsError";
    this.message = message;
  }
}
class CacheNotAvailableError extends Error {
  constructor(message) {
    super(message);
    this.name = "CacheNotAvailableError";
    this.message = message;
  }
}

// src/defs/options.ts
var TTL = Object.freeze({
  NO_EXPIRATION: 0,
  MINUTE: 60000,
  HOUR: 3600000
});

// src/defs/groups.ts
var getDefaultOptions = (group) => {
  switch (group) {
    case "default":
      return {
        group: "default",
        retentionPolicy: "persistent",
        scope: "global",
        ttl: TTL.MINUTE,
        async: false
      };
    case "static":
      return {
        group: "static",
        retentionPolicy: "persistent",
        scope: "global",
        ttl: TTL.MINUTE,
        async: false
      };
    default:
      throw new Error(`Invalid group: ${group}`);
  }
};

// src/defs/cache.ts
var DEFAULT_GROUP = "default";

// src/platforms/fs/cache.ts
class FileSystemCache {
  group;
  constructor(options) {
    this.group = options?.group || DEFAULT_GROUP;
  }
  get(key, options) {
    throw new Error("Method not implemented.");
  }
  getThenRefresh(key, options) {
    throw new Error("Method not implemented.");
  }
  set(key, value, options) {
    throw new Error("Method not implemented.");
  }
  delete(key) {
    throw new Error("Method not implemented.");
  }
}

// src/platforms/web/indexedDb.ts
class IndexedDbCache {
  group;
  constructor(options) {
    this.group = options.group || DEFAULT_GROUP;
  }
  get(key, options) {
    throw new Error("Method not implemented.");
  }
  getThenRefresh(key, options) {
    throw new Error("Method not implemented.");
  }
  set(key, value, options) {
    throw new Error("Method not implemented.");
  }
  delete(key) {
    throw new Error("Method not implemented.");
  }
}

// src/platforms/web/localStorage.ts
class LocalStorageCache {
  group;
  constructor(options) {
    this.group = options.group || DEFAULT_GROUP;
  }
  set(key, value, options) {
    this._rejectIfNotAvailable();
    window.localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  }
  get(key, options) {
    this._rejectIfNotAvailable();
    let value = window.localStorage.getItem(key);
    if (value == null) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(JSON.parse(value));
  }
  getThenRefresh(key, options) {
    throw new Error("Method not implemented.");
  }
  delete(key) {
    this._rejectIfNotAvailable();
    window.localStorage.removeItem(key);
    return Promise.resolve();
  }
  _rejectIfNotAvailable() {
    if (typeof window === "undefined" || !window) {
      throw new CacheNotAvailableError("localStorage is not available in this environment");
    }
    return Promise.resolve();
  }
}

// src/platforms/web/sessionStorage.ts
class SessionStorageCache {
  group;
  constructor(options) {
    this.group = options?.group || DEFAULT_GROUP;
  }
  set(key, value, options) {
    throw new Error("Method not implemented.");
  }
  get(key, options) {
    throw new Error("Method not implemented.");
  }
  getThenRefresh(key, options) {
    throw new Error("Method not implemented.");
  }
  delete(key) {
    throw new Error("Method not implemented.");
  }
}

// src/generate.ts
class CacheFactory {
  static create(type, platform, group, options) {
    const runtime = platform.runtime;
    const browser = platform.browser;
    const group_options = getDefaultOptions(group || "default");
    if (options) {
      options = { ...group_options, ...options };
    }
    if (!options) {
      options = group_options;
    }
    if (options?.ttl && options.ttl < 0) {
      throw new InvalidOptionsError("TTL must be equal to or greater than 0");
    }
    console.log("options", options);
    console.log("runtime", runtime);
    console.log("browser", browser);
    console.log("group", group);
    console.log("group_options", group_options);
    console.log("type", type);
    switch (type) {
      case "sync":
        if (runtime === "native") {
          return new FileSystemCache(options);
        }
        if (runtime === "web") {
          if (options?.retentionPolicy === "session") {
            return new SessionStorageCache(options);
          } else {
            return new LocalStorageCache(options);
          }
        }
      case "async":
        if (runtime === "native") {
          return new FileSystemCache(options);
        }
        if (runtime === "web") {
          return new IndexedDbCache(options);
        }
        throw new Error("Invalid runtime");
      case "stream":
        throw new Error("Not implemented");
    }
  }
}

// examples/basic.ts
console.log("Creating test sync cache...");
var cache = CacheFactory.create("sync", {
  runtime: "web",
  browser: {
    name: "chrome",
    version: "1.0.0",
    engine: "chrome",
    userAgent: "chrome"
  }
}, "static");
console.log("Cache created successfully");
cache.set("test", "value");
var testVal = cache.get("test");
console.log("Test:", testVal);
