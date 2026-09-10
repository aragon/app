import type { ISafeBalance } from '@/shared/api/safeService';

export const generateSafeBalance = (
    balance?: Partial<ISafeBalance>,
): ISafeBalance => ({
    tokenAddress: null,
    token: null,
    balance: '0',
    ...balance,
});
