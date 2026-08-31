import { randomHex } from '@/modules/mpc/utils/mpcCrypto';

/**
 * POC / mock: per-browser device key used to encrypt the device shares at rest. Generated once per browser
 * (random 32 bytes) and kept in localStorage: possession of this browser profile is the first factor, the
 * co-signer enforces the authenticator (TOTP) second factor before releasing its share. Clearing the browser
 * storage discards the key together with the encrypted shares (recover with the recovery share).
 */

const DEVICE_KEY_STORAGE_KEY = 'aragon-mpc-poc:deviceKey';
const DEVICE_KEY_BYTES = 32;

const getLocalStorage = (): Storage => {
    if (typeof localStorage === 'undefined') {
        throw new Error('deviceKey: no storage available');
    }

    return localStorage;
};

/**
 * Returns the device key of this browser, generating and persisting it on first use.
 */
export const getDeviceKey = (): string => {
    const storage = getLocalStorage();
    const existing = storage.getItem(DEVICE_KEY_STORAGE_KEY);

    if (existing != null) {
        return existing;
    }

    const created = randomHex(DEVICE_KEY_BYTES);
    storage.setItem(DEVICE_KEY_STORAGE_KEY, created);

    return created;
};

export const deviceKey = {
    getDeviceKey,
};
