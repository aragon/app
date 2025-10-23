import type { Network } from '@/shared/api/daoService';
import type { Hex } from 'viem';

/**
 * Gauge data from the backend /v2/gauge/:pluginAddress/:network endpoint.
 */
export interface IGauge {
    network: Network;
    blockNumber: number;
    transactionHash: Hex;
    address: Hex;
    pluginAddress: Hex;
    creatorAddress: Hex;
    name: string | null;
    description: string | null;
    links: string | null;
    avatar: string | null;
    isActive: boolean;
    metrics: {
        voteCount: number;
        votingPower: string;
        epochId: string;
    };
}
