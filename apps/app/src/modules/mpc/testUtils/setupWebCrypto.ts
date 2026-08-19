import { webcrypto } from 'node:crypto';

/**
 * jsdom does not expose WebCrypto (subtle / getRandomValues), install the node implementation for tests.
 */
export const setupWebCrypto = () => {
    if (globalThis.crypto?.subtle == null) {
        Object.defineProperty(globalThis, 'crypto', {
            value: webcrypto,
            configurable: true,
        });
    }
};
