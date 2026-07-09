import type { VoteOption } from './enum';

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
