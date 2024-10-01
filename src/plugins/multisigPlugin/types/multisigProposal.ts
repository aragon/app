import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IMultisigPluginSettings } from './multisigPluginSettings';

export interface IMultisigProposal extends IProposal {
    /**
     * Settings that were active when the proposal was created.
     */
    settings: IMultisigPluginSettings;
    /**
     * Plugin-specific metrics of the proposal.
     */
    metrics: {
        /**
         * Number of wallets that approved the proposal.
         */
        totalVotes: number;
    };
}
