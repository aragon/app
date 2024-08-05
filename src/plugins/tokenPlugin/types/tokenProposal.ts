import type { IToken } from '@/modules/finance/api/financeService';
import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IDaoTokenSettings } from './daoTokenSettings';
import type { ITokenProposalOptionVotes } from './tokenProposalOptionVotes';

export interface ITokenProposal extends IProposal {
    /**
     * Settings that were active when the proposal was created.
     */
    settings: IDaoTokenSettings['settings'];
    /**
     * Governance token used for the proposal.
     */
    token: IToken;
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
