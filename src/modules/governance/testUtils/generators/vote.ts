import { Network } from '@/shared/api/daoService';
import type { IVote } from '../../api/governanceService';

export const generateVote = (vote?: Partial<IVote>): IVote => ({
    transactionHash: '0x123',
    blockTimestamp: 0,
    memberAddress: '0x456',
    network: Network.BASE_MAINNET,
    ...vote,
});
