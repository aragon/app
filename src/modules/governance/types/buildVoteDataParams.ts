export interface IBuildVoteDataOption<TOptionValue = number> {
    /**
     * Value of the vote.
     */
    value: TOptionValue;
}

export interface IBuildVoteDataParams<
    TOptionValue = number,
    TOption extends IBuildVoteDataOption<TOptionValue> = IBuildVoteDataOption<TOptionValue>,
> {
    /**
     * The incremental ID of the proposal.
     */
    proposalIndex: string;
    /**
     * The vote option selected by the user.
     */
    vote: TOption;
}
