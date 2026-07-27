import type { IToken } from '@/modules/finance/api/financeService';
import type { IVote } from '@/modules/governance/api/governanceService';
import type { VoteOption } from './enum';
import type { IVoteOverridden } from './voteOverridden';

export interface ITokenVote extends IVote {
    /**
     * Governance token of the DAO.
     */
    token: IToken;
    /**
     * Voting power of the user at the moment of the vote.
     */
    votingPower: string;
    /**
     * Defines which option the user voted.
     */
    voteOption: VoteOption;
    /**
     * Set when the vote has been overridden by the delegators of the voter (Alchemix token-voting build).
     */
    voteOverridden?: IVoteOverridden;
}
