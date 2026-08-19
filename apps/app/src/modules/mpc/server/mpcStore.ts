import 'server-only';
import {
    existsSync,
    mkdirSync,
    readFileSync,
    renameSync,
    writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import type {
    IMpcActivity,
    IMpcSignRequest,
    IMpcSystem,
} from '@/modules/mpc/api/mpcService/domain';
import type { IMpcEncryptedValue } from './serverCrypto';

/**
 * POC persistence: a single JSON file (default apps/app/.mpc-poc/store.json) loaded once per process and cached
 * on globalThis so it survives Next.js HMR. Writes are atomic (tmp file + rename). Not meant for production.
 */

export interface IMpcStoreUser {
    id: string;
    username: string;
    passwordHash: string;
    salt: string;
    createdAt: string;
}

export interface IMpcStoreSession {
    /**
     * SHA-256 of the session token stored in the cookie.
     */
    id: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
    lastSeenAt: string;
    ip?: string;
    userAgent?: string;
}

export interface IMpcStoreServerShare extends IMpcEncryptedValue {
    /**
     * Epoch of the share, must match the system epoch.
     */
    epoch: number;
}

export interface IMpcStoreSystem extends IMpcSystem {
    /**
     * Server share encrypted at rest (AES-256-GCM). Never returned by the API except through the server-share endpoint.
     */
    serverShare?: IMpcStoreServerShare;
    /**
     * Soft delete timestamp.
     */
    deletedAt?: string;
}

export interface IMpcStoreLoginAttempt {
    failures: number;
    firstFailureAt: number;
    lockedUntil?: number;
}

export interface IMpcStoreData {
    version: 1;
    users: IMpcStoreUser[];
    sessions: IMpcStoreSession[];
    systems: IMpcStoreSystem[];
    signRequests: IMpcSignRequest[];
    activity: IMpcActivity[];
    loginAttempts: Record<string, IMpcStoreLoginAttempt>;
}

const emptyStoreData = (): IMpcStoreData => ({
    version: 1,
    users: [],
    sessions: [],
    systems: [],
    signRequests: [],
    activity: [],
    loginAttempts: {},
});

const GLOBAL_CACHE_KEY = '__mpcPocStore';

type GlobalWithStore = typeof globalThis & {
    [GLOBAL_CACHE_KEY]?: Record<string, IMpcStoreData>;
};

const getGlobalCache = (): Record<string, IMpcStoreData> => {
    const globalWithStore = globalThis as GlobalWithStore;
    globalWithStore[GLOBAL_CACHE_KEY] ??= {};

    return globalWithStore[GLOBAL_CACHE_KEY];
};

export const getDefaultMpcStorePath = (): string => {
    const envPath = process.env.MPC_POC_STORE_PATH?.trim();

    return envPath != null && envPath.length > 0
        ? envPath
        : join(process.cwd(), '.mpc-poc', 'store.json');
};

export class MpcStore {
    constructor(private readonly filePath: string) {}

    /**
     * Returns the in-memory data (loaded from disk on first access).
     */
    read = (): IMpcStoreData => {
        const cache = getGlobalCache();
        cache[this.filePath] ??= this.load();

        return cache[this.filePath];
    };

    /**
     * Applies a mutation to the data and persists it atomically. Returns the mutator result.
     */
    update = <TResult>(mutator: (data: IMpcStoreData) => TResult): TResult => {
        const data = this.read();
        const result = mutator(data);
        this.persist(data);

        return result;
    };

    /**
     * Drops the cached data (tests / tooling).
     */
    reset = (): void => {
        const cache = getGlobalCache();
        delete cache[this.filePath];
    };

    getFilePath = (): string => this.filePath;

    private load = (): IMpcStoreData => {
        if (!existsSync(this.filePath)) {
            return emptyStoreData();
        }

        const raw = readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw) as Partial<IMpcStoreData>;

        return { ...emptyStoreData(), ...parsed, version: 1 };
    };

    private persist = (data: IMpcStoreData): void => {
        const directory = dirname(this.filePath);
        mkdirSync(directory, { recursive: true });

        const tmpPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
        writeFileSync(tmpPath, JSON.stringify(data, null, 2), {
            encoding: 'utf8',
            mode: 0o600,
        });
        renameSync(tmpPath, this.filePath);
    };
}

// Default store singleton (path resolved lazily from the environment).
let defaultStore: MpcStore | undefined;

export const getMpcStore = (): MpcStore => {
    defaultStore ??= new MpcStore(getDefaultMpcStorePath());

    return defaultStore;
};

export const nowIso = (): string => new Date().toISOString();
