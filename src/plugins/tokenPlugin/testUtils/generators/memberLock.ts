import type { IMemberLock } from '../../api/tokenService';

export const generateTokenLock = (lock?: Partial<IMemberLock>): IMemberLock => ({
    id: 'lock-id',
    ...lock,
});
