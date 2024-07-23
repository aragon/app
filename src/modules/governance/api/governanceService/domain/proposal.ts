export interface IProposal {
    /**
     * Id of the proposal in DaoAddress-PluginAddress-ProposalId format.
     */
    id: string;
    /**
     * Incremental ID of the proposal.
     */
    proposalId: string;
    /**
     * Title of the proposal.
     */
    title: string;
    /**
     * Creation date of the proposal.
     */
    blockTimestamp: number;
    /**
     * Short summary of the proposal.
     */
    summary: string;
    /**
     * Description of the proposal in HTML format.
     */
    description: string | null;
    /**
     * Timestamp of the end date of the proposal.
     */
    endDate: number;
    /**
     * Address of the creator of the proposal.
     */
    creatorAddress: string;
    /**
     * Address of the DAO related to the proposal.
     */
    daoAddress: string;
    /**
     * Transaction hash of the proposal creation.
     */
    transactionHash: string;
}
