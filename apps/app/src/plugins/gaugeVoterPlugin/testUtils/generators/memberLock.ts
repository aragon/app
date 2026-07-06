import { DateTime } from 'luxon';
import type { IMemberLock } from '../../api/locksService';

export const generateGaugeVoterLock = (
    lock?: Partial<IMemberLock>,
): IMemberLock => ({
    id: 'lock-id',
    tokenId: 'token-id',
    epochStartAt: DateTime.now().toSeconds(),
    amount: '1000',
    lockExit: { status: false, exitDateAt: null },
    nft: { name: 'VE NFT' },
    ...lock,
});
