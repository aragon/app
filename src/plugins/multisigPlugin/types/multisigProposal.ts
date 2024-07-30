import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IDaoMultisigSettings } from './daoMultisigSettings';

export interface IMultisigProposal extends IProposal {
    /**
     * Settings that were active when the proposal was created.
     */
    settings: IDaoMultisigSettings['settings'];
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
