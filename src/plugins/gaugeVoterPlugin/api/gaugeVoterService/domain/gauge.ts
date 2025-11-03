import type { IResource } from '@/shared/api/daoService';
import type { Hex } from 'viem';

/**
 * Gauge data from the backend /v2/gauge/:pluginAddress/:network endpoint.
 */
export interface IGauge {
    /**
     * Address of the gauge.
     */
    address: Hex;
    /**
     * Address of the GaugeVoter plugin.
     */
    pluginAddress: Hex;
    /**
     * Name of the gauge (metadata).
     */
    name: string | null;
    /**
     * Description of the gauge (metadata).
     */
    description: string | null;
    /**
     * Links related to the gauge (metadata).
     */
    links?: IResource[];
    /**
     * Avatar of the gauge (metadata).
     */
    avatar: string | null;
    /**
     * Flag whether the gauge is active.
     */
    isActive: boolean;
    /**
     * Metrics of the gauge.
     */
    metrics: {
        /**
         * Total voting power applied to the gauge in the current epoch. Matches
         * totalVotingPowerInGauge Voted event argument.
         */
        currentEpochVotingPower: string;
        /**
         * We actually use Epoch metrics instead of this one!
         *
         * Total voting power applied across all gauges in the current epoch.
         * If the votes persist between epochs (as they do in VE) then
         * totalVotingPower will be across ALL EPOCHS.
         *
         * Matches totalVotingPowerInContract Voted event argument.
         */
        totalGaugeVotingPower: string;
        /**
         * Epoch ID.
         */
        epochId: string;
    };
}
