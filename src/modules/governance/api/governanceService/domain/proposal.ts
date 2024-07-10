export interface IProposal {
    /**
     * Id of the proposal.
     */
    id: string;
    /**
     * Title of the proposal.
     */
    title: string;
    /**
     * Summary of the proposal.
     */
    summary: string;
    /**
     * Timestamp of the end date of the proposal.
     */
    endDate: number;
    /**
     * Address of the creator of the proposal.
     */
    creatorAddress: string;
}
