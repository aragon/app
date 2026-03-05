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
}
