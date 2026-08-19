import type { IMpcProviderAdapter } from './mpcProvider.api';

/**
 * Stub: integration point for a real Dfns TSS provider (not implemented in the POC).
 *
 * How it would connect:
 * - createKey: call the Dfns Wallets API (`@dfns/sdk` on the client with a delegated / WebAuthn signer) to
 *   create a wallet; Dfns holds its key shares in its signing cluster and the user holds a WebAuthn credential
 *   (no share ever reaches the browser). serverShare / recoveryShare would be empty placeholders and the co-signer
 *   would only store the wallet id and policy.
 * - sign: `POST /wallets/{id}/signatures` (or `/transactions`) with the message / typed data / tx, approved by the
 *   user through the WebAuthn credential; Dfns policies would mirror the local IMpcPolicy.
 * - reshare / recover / exportKey: handled by Dfns (key rotation, wallet export with a client-side encryption key).
 */

export const dfnsProvider: IMpcProviderAdapter = {
    id: 'dfns',
    label: 'Dfns (TSS)',
    isMock: false,
    createKey: () => Promise.reject(new Error('Not implemented in POC')),
    verifyDeviceShare: () =>
        Promise.reject(new Error('Not implemented in POC')),
    sign: () => Promise.reject(new Error('Not implemented in POC')),
    reshare: () => Promise.reject(new Error('Not implemented in POC')),
    recover: () => Promise.reject(new Error('Not implemented in POC')),
    exportKey: () => Promise.reject(new Error('Not implemented in POC')),
    hasDeviceShare: () => Promise.resolve(false),
};
