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
    proposalInfo?: {
        /**
         * Unique identifier of the proposal.
         */
        id: string;
        /**
         * Index of the proposal.
         */
        index: number;
        /**
         * URI to fetch the proposal metadata.
         */
        metadataUri: string;
        /**
         * Title of the proposal.
         */
        title: string;
        /**
         * Summary of the proposal.
         */
        summary: string | null;
        /**
         * Description of the proposal.
         */
        description: string | null;
        /**
         * Resources attached to the proposal.
         */
        resources: [];
        /**
         * Media information attached to the proposal.
         */
        media: {
            /**
             * Header image of the proposal.
             */
            header: string | null;
            /**
             * Logo of the proposal.
             */
            logo: string | null;
        };
    };
}
