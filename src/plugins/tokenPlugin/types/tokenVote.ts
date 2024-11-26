import type { IToken } from '@/modules/finance/api/financeService';
import type { IVote } from '@/modules/governance/api/governanceService';
import type { VoteOption } from './enum';

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
     * Hash of the transaction that replaced the vote.
     */
    replacedTransactionHash?: string;
}
