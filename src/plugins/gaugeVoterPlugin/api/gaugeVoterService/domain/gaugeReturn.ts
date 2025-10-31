import type { Network } from '@/shared/api/daoService';
import type { Hex } from 'viem';

/**
 * Link resource for a gauge.
 */
export interface IGaugeLink {
    name: string;
    url: string;
}

/**
 * Gauge data from the backend /v2/gauge/:pluginAddress/:network endpoint.
 */
export interface IGaugeReturn {
    network: Network;
    blockNumber: number;
    transactionHash: Hex;
    address: Hex;
    pluginAddress: Hex;
    creatorAddress: Hex;
    name: string | null;
    description: string | null;
    links?: IGaugeLink[];
    avatar: string | null;
    isActive: boolean;
    metrics: {
        totalMemberVoteCount: number;
        currentEpochVotingPower: string;
        totalGaugeVotingPower: string;
        epochId: string;
    };
}
