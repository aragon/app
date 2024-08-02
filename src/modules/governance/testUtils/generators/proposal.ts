import { Network } from '@/shared/api/daoService';
import type { IProposal } from '../../api/governanceService';

export const generateProposal = (proposal?: Partial<IProposal>): IProposal => ({
    id: '1',
    proposalId: '0',
    title: 'title',
    startDate: 0,
    endDate: 1234567890,
    summary: 'summary',
    creatorAddress: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
    blockTimestamp: 0,
    description: 'description',
    daoAddress: '0x123',
    transactionHash: '0x123',
    resources: [],
    network: Network.ARBITRUM_MAINNET,
    settings: {},
    ...proposal,
});
