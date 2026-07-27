export interface ISppExternalProposer {
    /**
     * Address of the Safe granted proposal-creation permission that is not a stage body.
     */
    address: string;
    /**
     * Address of the SafeOwnerCondition guarding the Safe's proposal-creation permission.
     */
    proposalCreationConditionAddress: string;
}
