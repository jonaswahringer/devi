import { CacheFactory } from "../src/generate";

console.log("Creating test sync cache...")

const cache = CacheFactory.create<string>('sync', {
        runtime: 'web',
        browser: {
            name: 'chrome',
            version: '1.0.0',
            engine: 'chrome',
            userAgent: 'chrome',
        }
    },
    'static'
);

console.log("Cache created successfully")

cache.set('test', 'value');

const testVal = cache.get('test');
console.log("Test:", testVal)
