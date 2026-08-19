import type { IMpcProviderAdapter } from './mpcProvider.api';

/**
 * Stub: integration point for the Dynamic embedded (TSS-MPC) wallet provider (not implemented in the POC).
 *
 * How it would connect:
 * - createKey: use `@dynamic-labs/sdk-react-core` + the waas connector to create an embedded MPC wallet; the
 *   client share is generated in the browser (Dynamic SDK, optionally passkey-protected) and the server share is
 *   held by Dynamic; the Aragon co-signer would only store the wallet address and policy.
 * - sign: the Dynamic wallet client (viem WalletClient) signs messages / typed data / transactions with the TSS
 *   protocol between the browser share and the Dynamic share; the co-signer policy check would gate the request
 *   before the UI asks the wallet to sign.
 * - reshare / recover / exportKey: Dynamic SDK key refresh, recovery (email / passkey) and export flows.
 */
export const dynamicProvider: IMpcProviderAdapter = {
    id: 'dynamic',
    label: 'Dynamic (TSS)',
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
