let setTimeout;
let clearTimeout;

if (typeof global !== 'undefined') {
    setTimeout = global.setTimeout;
    clearTimeout = global.clearTimeout;
} else {
    setTimeout = window.setTimeout;
    clearTimeout = window.clearTimeout;
}

export interface IMutex {
    capture(key: string): Promise<() => void>;
}

export interface IMutexOptions {
    /**
     * Inteval of polling captured mutex
     */
    intervalMs?: number;
    /**
     * Timeout of auto-unlocking mutex
     */
    autoUnlockTimeoutMs?: number;
    /**
     * Custom Promise
     */
    Promise?: PromiseConstructor;
}

export class Mutex implements IMutex {
    /**
     * Default mutex options.
     * @type {IMutexOptions}
     */
    public static readonly DEFAULT_OPTIONS: IMutexOptions = {
        intervalMs: 50,
        autoUnlockTimeoutMs: 3000
    };

    /**
     * Map of captured mutex keys.
     * @type {{}}
     */
    protected storage: {} = {};

    /**
     * Current mutex instance options.
     */
    protected options: IMutexOptions;

    constructor(options: IMutexOptions = {}) {
        const SelectedPromise = options.Promise || Promise;

        if (!SelectedPromise) {
            throw new Error(
                'Could not get Promise object in current env. You should pass custom Promise lib to constructor options'
            );
        }

        this.options = {
            Promise: SelectedPromise,
            intervalMs: (options && options.intervalMs) || Mutex.DEFAULT_OPTIONS.intervalMs,
            autoUnlockTimeoutMs: (options && options.autoUnlockTimeoutMs) || Mutex.DEFAULT_OPTIONS.autoUnlockTimeoutMs
        };
    }

    /**
     * Try to capture mutex by provided key.
     * @see checkMutexAndLock
     * @param key
     * @returns {Promise<()=>void>}
     */
    public capture(key: string): Promise<() => void> {
        return new this.options.Promise<() => void>((resolve, reject) => {
            this.checkMutexAndLock(key, resolve, reject);
        });
    }

    /**
     * Checks inner storage for key. Sets new key if key does not exist.
     * If key exists - waits for key deletion.
     * Resolves with function - key deleter.
     *
     * @param key
     * @param resolve
     * @param reject
     */
    protected checkMutexAndLock(key: string, resolve: (arg: any) => void, reject: (arg: any) => void): void {
        if (!this.storage[key]) {
            const value = Date.now();
            this.storage[key] = value;

            const timeout = setTimeout(() => {
                delete this.storage[key];
            }, this.options.autoUnlockTimeoutMs);

            resolve(() => {
                clearTimeout(timeout);
                if (this.storage[key] === value) {
                    delete this.storage[key];
                }
            });
        } else {
            setTimeout(this.checkMutexAndLock.bind(this, key, resolve, reject), this.options.intervalMs);
        }
    }
}