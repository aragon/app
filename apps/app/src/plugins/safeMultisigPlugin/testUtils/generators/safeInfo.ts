import type { ISafeInfoResponse } from '@/shared/api/safeService';

/**
 * Produces what the body state actually holds: the backend response, including the freshness
 * metadata a consumer needs to tell a current payload from one served stale.
 */
export const generateSafeInfo = (
    safeInfo?: Partial<ISafeInfoResponse>,
): ISafeInfoResponse => ({
    address: '0x0000000000000000000000000000000000000001',
    nonce: '0',
    threshold: 2,
    owners: [
        '0x0000000000000000000000000000000000000011',
        '0x0000000000000000000000000000000000000012',
    ],
    version: '1.4.1',
    modules: [],
    guard: null,
    meta: {
        source: 'chain',
        fetchedAt: '2026-08-26T12:00:00.000Z',
        stale: false,
    },
    ...safeInfo,
});
