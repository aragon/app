import type { IProposal } from '@/modules/governance/api/governanceService';
import type { ITokenPluginSettings } from './tokenPluginSettings';
import type { ITokenProposalOptionVotes } from './tokenProposalOptionVotes';

export interface ITokenProposal extends IProposal<ITokenPluginSettings> {
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
