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
}
