export interface IUseTokenTotalSupplyParams {
    /**
     * Address of the token contract. The query auto-disables when missing.
     */
    address?: string;
    /**
     * Chain ID of the token contract. The query auto-disables when missing.
     */
    chainId?: number;
    /**
     * Flag to enable or disable the query. Combined (AND) with the presence of
     * `address` and `chainId` — passing `false` always disables.
     * @default true
     */
    enabled?: boolean;
}

export interface IUseTokenTotalSupplyResult {
    /**
     * Total supply of the token.
     */
    data: bigint | undefined;
    /**
     * Defines if an error occurred while fetching the total supply.
     */
    isError: boolean;
    /**
     * Whether the total supply is loading.
     */
    isLoading: boolean;
}
