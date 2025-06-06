import { DateTime } from 'luxon';
import type { IMemberLock } from '../../api/tokenService';

export const generateTokenLock = (lock?: Partial<IMemberLock>): IMemberLock => ({
    id: 'lock-id',
    tokenId: 'token-id',
    epochStartAt: DateTime.now().toSeconds(),
    amount: '1000',
    votingPower: '1000',
    lockExit: {
        status: false,
        exitDateAt: null,
    },
    ...lock,
});
