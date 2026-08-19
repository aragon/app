import type { Hex } from 'viem';

/**
 * POC / mock: persistence of the encrypted device share (share A) in the browser.
 * Uses IndexedDB (database "aragon-mpc-poc", store "deviceShares", keyed by systemId) and falls back to
 * localStorage when IndexedDB is not available (e.g. tests, restricted contexts).
 */

export interface IDeviceShareRecord {
    /**
     * System the share belongs to (primary key).
     */
    systemId: string;
    /**
     * Key epoch the share belongs to.
     */
    epoch: number;
    /**
     * PBKDF2 salt (0x hex).
     */
    salt: Hex;
    /**
     * AES-GCM iv (0x hex).
     */
    iv: Hex;
    /**
     * Encrypted share (0x hex).
     */
    ciphertext: Hex;
    /**
     * Creation timestamp (ISO 8601).
     */
    createdAt: string;
}

const DB_NAME = 'aragon-mpc-poc';
const DB_VERSION = 1;
const STORE_NAME = 'deviceShares';
const LOCAL_STORAGE_PREFIX = 'aragon-mpc-poc:deviceShare:';

const hasIndexedDb = (): boolean =>
    typeof indexedDB !== 'undefined' && indexedDB != null;

const openDatabase = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'systemId' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
            reject(
                request.error ?? new Error('deviceShareStorage: open failed'),
            );
    });

const runTransaction = async <TResult>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<TResult>,
): Promise<TResult> => {
    const database = await openDatabase();

    try {
        return await new Promise<TResult>((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, mode);
            const request = operation(transaction.objectStore(STORE_NAME));

            request.onsuccess = () => resolve(request.result);
            request.onerror = () =>
                reject(
                    request.error ??
                        new Error('deviceShareStorage: request failed'),
                );
        });
    } finally {
        database.close();
    }
};

const getLocalStorage = (): Storage => {
    if (typeof localStorage === 'undefined') {
        throw new Error('deviceShareStorage: no storage available');
    }

    return localStorage;
};

const localStorageKey = (systemId: string) =>
    `${LOCAL_STORAGE_PREFIX}${systemId}`;

/**
 * Persists the encrypted device share for the system (overwrites any previous record).
 */
export const saveDeviceShare = async (
    record: IDeviceShareRecord,
): Promise<void> => {
    if (hasIndexedDb()) {
        await runTransaction('readwrite', (store) => store.put(record));

        return;
    }

    getLocalStorage().setItem(
        localStorageKey(record.systemId),
        JSON.stringify(record),
    );
};

/**
 * Loads the encrypted device share for the system, undefined when not present.
 */
export const loadDeviceShare = async (
    systemId: string,
): Promise<IDeviceShareRecord | undefined> => {
    if (hasIndexedDb()) {
        const result = await runTransaction<IDeviceShareRecord | undefined>(
            'readonly',
            (store) => store.get(systemId),
        );

        return result ?? undefined;
    }

    const raw = getLocalStorage().getItem(localStorageKey(systemId));

    return raw != null ? (JSON.parse(raw) as IDeviceShareRecord) : undefined;
};

/**
 * Whether a device share exists for the system in this browser.
 */
export const hasDeviceShare = async (systemId: string): Promise<boolean> => {
    const record = await loadDeviceShare(systemId);

    return record != null;
};

/**
 * Removes the device share of the system.
 */
export const deleteDeviceShare = async (systemId: string): Promise<void> => {
    if (hasIndexedDb()) {
        await runTransaction('readwrite', (store) => store.delete(systemId));

        return;
    }

    getLocalStorage().removeItem(localStorageKey(systemId));
};

export const deviceShareStorage = {
    saveDeviceShare,
    loadDeviceShare,
    hasDeviceShare,
    deleteDeviceShare,
};
