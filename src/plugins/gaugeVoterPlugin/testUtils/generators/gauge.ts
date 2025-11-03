import type { Hex } from 'viem';
import type { IGauge } from '../../api/gaugeVoterService/domain';

export const generateGauge = (overrides?: Partial<IGauge>): IGauge => ({
    address: '0x1234567890123456789012345678901234567890' as Hex,
    pluginAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Hex,
    name: 'Test Gauge',
    description: 'A test gauge for development',
    links: [],
    avatar: null,
    isActive: true,
    metrics: {
        currentEpochVotingPower: '0',
        totalGaugeVotingPower: '0',
        epochId: 'epoch-1',
    },
    ...overrides,
});
