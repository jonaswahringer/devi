export class InvalidOptionsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidOptionsError';
        this.message = message;
    }
}

export class UnsupportedCacheTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnsupportedCacheTypeError';
        this.message = message;
    }
}

export class CacheNotAvailableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CacheNotAvailableError';
        this.message = message;
    }
}