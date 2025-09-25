export interface IUseTokenCurrentDelegateResult {
    /**
     * The current delegate address.
     */
    currentDelegate: string | null;
    /**
     * Whether the query is loading.
     */
    isLoading: boolean;
    /**
     * Defines if an error occurred while fetching the current delegate.
     */
    isError: boolean;
}
