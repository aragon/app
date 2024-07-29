import type { IToken } from '@/modules/finance/api/financeService';
import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IDaoTokenSettings } from './daoTokenSettings';
import type { VoteOption } from './enum/voteOption';

export interface ITokenProposalOptionVotes {
    /**
     * Vote option.
     */
    type: VoteOption;
    /**
     * Total voting power of members that voted this vote option.
     */
    totalVotingPower: string;
}

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
         * Number of members that votes on the proposal.
         */
        totalVotes: number;
        /**
         * Overview of each vote option.
         */
        votesByOption: ITokenProposalOptionVotes[];
    };
}
