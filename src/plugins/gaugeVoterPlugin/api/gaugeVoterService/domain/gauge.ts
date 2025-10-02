import type { Hex } from 'viem';
import type { IResource } from '@/shared/api/daoService';

export interface IGauge {
    /**
     * Address of the gauge contract.
     */
    address: Hex;
    /**
     * Name of the gauge from metadata.
     */
    name: string;
    /**
     * Description of the gauge from metadata.
     */
    description: string;
    /**
     * Resources associated with the gauge.
     */
    resources: IResource[];
    /**
     * Total votes allocated to this gauge from GaugeVoterContract.
     */
    totalVotes: number;
    /**
     * User's votes allocated to this gauge from GaugeVoterContract.
     */
    userVotes: number;
}