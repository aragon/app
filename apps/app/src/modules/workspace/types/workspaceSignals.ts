export interface IWorkspaceSignals {
    /**
     * Addresses of the targets with an ownership transfer in flight.
     */
    pendingOwnerTargets: string[];
    /**
     * Addresses of the targets delegating their permissions to an authority contract, meaning their
     * gate list is incomplete.
     */
    delegatedAuthorityTargets: string[];
    /**
     * Addresses of the targets that could not be processed.
     */
    failedTargets: string[];
    /**
     * Addresses of the targets with at least one gate that nobody holds.
     */
    unclaimedGateTargets: string[];
    /**
     * Addresses of the accounts that are not resolved to a DAO, e.g. externally owned accounts.
     */
    externalAccounts: string[];
    /**
     * Number of gates that were inferred instead of read from the contract.
     */
    inferredGateCount: number;
}
