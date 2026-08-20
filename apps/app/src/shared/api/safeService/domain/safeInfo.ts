export interface ISafeInfo {
    /**
     * Checksummed address of the Safe.
     */
    address: string;
    /**
     * Next nonce the Safe will execute. A queued transaction is only live when its nonce is
     * greater than or equal to this value.
     */
    nonce: number;
    /**
     * Number of owner confirmations required to execute a transaction. Read live, never cached
     * across sessions: owners and threshold can change while a transaction is queued.
     */
    threshold: number;
    /**
     * Checksummed addresses of the current Safe owners.
     */
    owners: string[];
    /**
     * Deployed Safe contract version (e.g. `1.4.1`). Safes below `1.4.1` are under the EIP-1271
     * floor, so consumers must read this rather than assuming a version.
     */
    version: string;
    /**
     * Addresses of the modules enabled on the Safe.
     */
    modules: string[];
    /**
     * Address of the transaction guard, or null when no guard is set.
     */
    guard: string | null;
}
