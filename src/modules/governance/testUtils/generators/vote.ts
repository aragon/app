import { Network } from '@/shared/api/daoService';
import { generateAddressInfo } from '@/shared/testUtils';
import type { IVote } from '../../api/governanceService';

export const generateVote = (vote?: Partial<IVote>): IVote => ({
    transactionHash: '0x123',
    blockTimestamp: 0,
    member: generateAddressInfo(),
    network: Network.BASE_MAINNET,
    ...vote,
});
