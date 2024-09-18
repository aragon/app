export interface IVoteValues {
    voteOption: string;
    title: string;
    summary: string;
    proposalId: string;
}

export interface IVoteDialogParams {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Values
     */
    values: IVoteValues;
}
