import { Network } from '@/shared/api/daoService';
import { generateAddressInfo, generatePluginSettings } from '@/shared/testUtils';
import type { IProposal } from '../../api/governanceService';

export const generateProposal = (proposal?: Partial<IProposal>): IProposal => ({
    id: '1',
    proposalIndex: '0',
    title: 'title',
    startDate: 0,
    endDate: 1234567890,
    summary: 'summary',
    creator: generateAddressInfo(),
    blockTimestamp: 0,
    description: 'description',
    daoAddress: '0x123',
    transactionHash: '0x123',
    resources: [],
    network: Network.ARBITRUM_MAINNET,
    settings: generatePluginSettings(),
    executed: { status: false },
    pluginAddress: '0x123',
    pluginSubdomain: 'test',
    incrementalId: 1,
    hasActions: false,
    ...proposal,
});
