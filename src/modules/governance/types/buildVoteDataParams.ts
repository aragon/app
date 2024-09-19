export interface IBuildVoteDataParams {
    /**
     * The incremental ID of the proposal.
     */
    proposalIndex: string;
    /**
     *  The vote option selected by the user for token based DAOs.
     */
    vote?: number;
}
