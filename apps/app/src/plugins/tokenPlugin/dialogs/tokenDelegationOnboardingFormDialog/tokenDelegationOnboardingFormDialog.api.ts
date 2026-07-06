export interface ITokenDelegationOnboardingDialogParams {
    /**
     * Address of the governance token.
     */
    tokenAddress: string;
    /**
     * Symbol of the governance token (e.g. "PDT").
     */
    tokenSymbol: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address to pre-populate in the delegate input. When set, the form opens with
     * "Someone else" selected and this address filled in.
     */
    delegateAddress?: string;
}
