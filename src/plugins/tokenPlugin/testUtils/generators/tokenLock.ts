import type { ITokenLock } from '@/plugins/tokenPlugin/api/tokenService';

export const generateTokenLock = (lock?: Partial<ITokenLock>): ITokenLock => ({
    id: 'lock-id',
    ...lock,
});
