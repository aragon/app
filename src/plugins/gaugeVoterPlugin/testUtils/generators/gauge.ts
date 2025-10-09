import type { Hex } from 'viem';
import type { IGauge } from '../../api/gaugeVoterService/domain';

export const generateGauge = (overrides?: Partial<IGauge>): IGauge => ({
    address: '0x1234567890123456789012345678901234567890' as Hex,
    name: 'Test Gauge',
    description: 'A test gauge for development',
    resources: [],
    totalVotes: 1000,
    userVotes: 0,
    ...overrides,
});
