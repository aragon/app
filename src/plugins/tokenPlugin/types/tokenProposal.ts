import type { IProposal } from '@/modules/governance/api/governanceService';
import type { ITokenPluginSettings } from './tokenPluginSettings';
import type { ITokenProposalOptionVotes } from './tokenProposalOptionVotes';

export interface ITokenProposal extends IProposal {
    /**
     * Settings that were active when the proposal was created.
     */
    settings: ITokenPluginSettings;
    /**
     * Plugin-specific metrics of the proposal.
     */
    metrics: {
        /**
         * Overview of each vote option.
         */
        votesByOption: ITokenProposalOptionVotes[];
    };
}
