import type { Redis } from '@upstash/redis';

interface IMockRedisEntry {
    value: string;
    expiresAt?: number;
}

// The commands the service issues (sessionStore + the two rate limiters). Signatures are the
// simple shapes the service uses; `asRedis` bridges to the full Upstash client type.
export interface IMockRedis {
    get(key: string): Promise<string | null>;
    set(
        key: string,
        value: string,
        opts?: { ex?: number; nx?: boolean },
    ): Promise<'OK' | null>;
    incrby(key: string, amount: number): Promise<number>;
    expire(key: string, seconds: number, mode?: 'NX'): Promise<number>;
    rpush(key: string, value: string): Promise<number>;
    lrange(key: string, start: number, end: number): Promise<string[]>;
    lrem(key: string, count: number, value: string): Promise<number>;
    del(...keys: string[]): Promise<number>;
    evalsha(sha: string, keys: string[], args: unknown[]): Promise<unknown>;
    eval(script: string, keys: string[], args: unknown[]): Promise<unknown>;
}

// In-memory Redis fake. Every method mutates the map synchronously before resolving, so
// concurrent callers observe the same atomicity guarantees as single Redis commands.
export const createMockRedis = (): IMockRedis => {
    const store = new Map<string, IMockRedisEntry>();

    const readEntry = (key: string): IMockRedisEntry | undefined => {
        const entry = store.get(key);

        if (entry?.expiresAt != null && entry.expiresAt <= Date.now()) {
            store.delete(key);

            return undefined;
        }

        return entry;
    };

    const readList = (key: string): string[] => {
        const entry = readEntry(key);

        return entry == null ? [] : (JSON.parse(entry.value) as string[]);
    };

    const writeList = (key: string, list: string[]) => {
        store.set(key, {
            value: JSON.stringify(list),
            expiresAt: readEntry(key)?.expiresAt,
        });
    };

    const incrementBy = (key: string, amount: number): number => {
        const entry = readEntry(key);
        const value = Number(entry?.value ?? 0) + amount;
        store.set(key, { value: String(value), expiresAt: entry?.expiresAt });

        return value;
    };

    const pexpire = (key: string, ttlMs: number) => {
        const entry = readEntry(key);
        if (entry != null) {
            store.set(key, { ...entry, expiresAt: Date.now() + ttlMs });
        }
    };

    // Emulates the two @upstash/ratelimit Lua scripts the service runs; both return
    // [remainingOrUsed, effectiveLimit].
    const runScript = (
        script: string,
        keys: string[],
        args: unknown[],
    ): unknown => {
        const key = keys[0];

        // Sliding window (requests per minute): weighted count of the previous bucket. The
        // args-count assertions turn a script change in a package upgrade into a loud failure
        // instead of a silent misroute.
        if (script.includes('previousKey') && args.length === 4) {
            const [limit, now, windowMs, incrementAmount] = (
                args as string[]
            ).map(Number);
            const current = Number(readEntry(key)?.value ?? 0);
            const inPreviousBucket = Number(readEntry(keys[1])?.value ?? 0);
            const previous = Math.floor(
                (1 - (now % windowMs) / windowMs) * inPreviousBucket,
            );

            if (incrementAmount > 0 && previous + current >= limit) {
                return [-1, limit];
            }

            const newValue = incrementBy(key, incrementAmount);
            if (newValue === incrementAmount) {
                pexpire(key, windowMs * 2 + 1000);
            }

            return [limit - (newValue + previous), limit];
        }

        // Fixed window (new sessions per day).
        if (script.includes('INCRBY') && args.length === 3) {
            const [limit, windowMs, incrementAmount] = args as string[];
            const used = incrementBy(key, Number(incrementAmount));
            if (used === Number(incrementAmount)) {
                pexpire(key, Number(windowMs));
            }

            return [used, Number(limit)];
        }

        throw new Error('Unsupported script in the Redis mock.');
    };

    return {
        get: (key) => Promise.resolve(readEntry(key)?.value ?? null),
        set: (key, value, opts) => {
            if (opts?.nx && readEntry(key) != null) {
                return Promise.resolve(null);
            }

            store.set(key, {
                value,
                expiresAt:
                    opts?.ex == null ? undefined : Date.now() + opts.ex * 1000,
            });

            return Promise.resolve('OK');
        },
        incrby: (key, amount) => Promise.resolve(incrementBy(key, amount)),
        expire: (key, seconds, mode) => {
            const entry = readEntry(key);
            if (entry == null || (mode === 'NX' && entry.expiresAt != null)) {
                return Promise.resolve(0);
            }

            store.set(key, {
                ...entry,
                expiresAt: Date.now() + seconds * 1000,
            });

            return Promise.resolve(1);
        },
        rpush: (key, value) => {
            const list = readList(key);
            list.push(value);
            writeList(key, list);

            return Promise.resolve(list.length);
        },
        lrange: (key) => Promise.resolve(readList(key)),
        lrem: (key, _count, value) => {
            const list = readList(key);
            const index = list.indexOf(value);

            if (index === -1) {
                return Promise.resolve(0);
            }

            list.splice(index, 1);
            writeList(key, list);

            return Promise.resolve(1);
        },
        del: (...keys) => {
            let deleted = 0;
            for (const key of keys) {
                deleted += store.delete(key) ? 1 : 0;
            }

            return Promise.resolve(deleted);
        },
        // @upstash/ratelimit sends precomputed script hashes; the NOSCRIPT error makes it fall
        // back to a plain EVAL with the script source, which runScript interprets.
        evalsha: () =>
            Promise.reject(new Error('NOSCRIPT No matching script.')),
        eval: (script, keys, args) =>
            Promise.resolve(runScript(script, keys, args)),
    };
};

// The production surface is the full Upstash client type; the fake implements exactly the
// commands the service issues (kept honest by the suites running on it).
export const asRedis = (mock: IMockRedis): Redis => mock as unknown as Redis;
