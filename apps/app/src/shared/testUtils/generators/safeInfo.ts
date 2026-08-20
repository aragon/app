import type { ISafeInfo } from '@/shared/api/safeService';

export const generateSafeInfo = (safeInfo?: Partial<ISafeInfo>): ISafeInfo => ({
    address: '0xSafeAddress',
    nonce: 0,
    threshold: 1,
    owners: ['0xOwnerAddress'],
    version: '1.4.1',
    modules: [],
    guard: null,
    ...safeInfo,
});
