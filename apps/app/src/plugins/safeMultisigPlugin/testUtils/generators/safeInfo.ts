import type { ISafeInfo } from '@/shared/api/safeService';

export const generateSafeInfo = (safeInfo?: Partial<ISafeInfo>): ISafeInfo => ({
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
    ...safeInfo,
});
