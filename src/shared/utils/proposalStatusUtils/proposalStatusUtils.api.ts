export interface IGetProposalStatusParams {
    /**
     * Indicates whether the proposal has already been executed.
     */
    isExecuted: boolean;
    /**
     * Indicates whether the proposal has been vetoed.
     */
    isVetoed: boolean;
    /**
     * Start date of the proposal in seconds.
     */
    startDate: number;
    /**
     * End date of the proposal in seconds. May be undefined if not yet determined, such as in multi-stage proposals
     * where the current stage is not the final one.
     */
    endDate?: number;
    /**
     * The expiration date for executing the proposal. May be undefined for plugins that do not define an expiration for
     * the execution of proposals.
     */
    executionExpiryDate?: number;
    /**
     * Indicates whether the conditions for the proposal to be considered "accepted" have been met.
     */
    paramsMet: boolean;
    /**
     * Indicates whether the proposal includes actions to be executed.
     */
    hasActions: boolean;
    /**
     * Indicates whether the proposal can be executed before reaching its end date.
     */
    canExecuteEarly: boolean;
    /**
     * Indicates whether the proposal has stages that can be advanced, applicable to multi-stage proposals.
     */
    hasAdvanceableStages?: boolean;
    /**
     * Indicates whether any stage of the proposal has expired, applicable to multi-stage proposals.
     */
    hasExpiredStages?: boolean;
}
