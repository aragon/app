import { type IVoteProposalInfo } from '@/modules/governance/api/governanceService/domain/voteProposalInfo';
import type { Network } from '@/shared/api/daoService';

export interface IVote {
    /**
     * Hash of the transaction including the user vote.
     */
    transactionHash: string;
    /**
     * Timestamp of the transaction block.
     */
    blockTimestamp: number;
    /**
     * Address of the member casting the vote.
     */
    memberAddress: string;
    /**
     * Network where the vote has been casted.
     */
    network: Network;
    /**
     * Extra information about the proposal if includeInfo is true on the query.
     */
    proposalInfo?: IVoteProposalInfo;
}
