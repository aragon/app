import type { IResource } from '@/shared/api/daoService';
import type { Hex } from 'viem';

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
     * Logo url of the gauge from metadata.
     */
    logo?: string;
    /**
     * Total votes allocated to this gauge from GaugeVoterContract.
     */
    totalVotes: number;
    /**
     * User's votes allocated to this gauge from GaugeVoterContract.
     */
    userVotes: number;
}
