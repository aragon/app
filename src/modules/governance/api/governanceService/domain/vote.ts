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
     * Network where the vote has been cast.
     */
    network: Network;
    /**
     * ID of the DAO where the vote has been cast.
     */
    daoId?: string;
    /**
     * ID of the proposal where the vote has been cast.
     */
    proposalId?: string;
    /**
     * Name of the proposal where the vote has been cast.
     */
    proposalName?: string;
    /**
     * Vote casted by the member.
     */
    vote?: 'yes' | 'no' | 'abstain';
}
