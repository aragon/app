import { Network } from '@/shared/api/daoService';
import type { Hex } from 'viem';
import type { IGaugeReturn } from '../../api/gaugeVoterService/domain';

export const generateGauge = (overrides?: Partial<IGaugeReturn>): IGaugeReturn => ({
    network: Network.BASE_MAINNET,
    blockNumber: 1,
    transactionHash: '0xabc123' as Hex,
    address: '0x1234567890123456789012345678901234567890' as Hex,
    pluginAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Hex,
    creatorAddress: '0x9876543210987654321098765432109876543210' as Hex,
    name: 'Test Gauge',
    description: 'A test gauge for development',
    links: [],
    avatar: null,
    isActive: true,
    metrics: {
        totalMemberVoteCount: 0,
        currentEpochVotingPower: '0',
        totalGaugeVotingPower: '0',
        epochId: 'epoch-1',
    },
    ...overrides,
});
