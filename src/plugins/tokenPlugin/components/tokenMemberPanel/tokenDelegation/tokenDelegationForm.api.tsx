export enum TokenDelegationSelection {
    YOURSELF = 'YOURSELF',
    OTHER = 'OTHER',
}

export interface ITokenDelegationFormData {
    /**
     * Current selection for the delegate.
     */
    selection: TokenDelegationSelection;
    /**
     * Address to delegate the voting power to.
     */
    delegate?: string;
}

export interface ITokenDelegationFormProps {
    /**
     * Address of the token used by the plugin.
     */
    tokenAddress: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
}
