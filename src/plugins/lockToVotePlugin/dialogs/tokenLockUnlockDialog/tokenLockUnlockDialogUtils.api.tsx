export interface IBuildTokenLockTransactionParams {
    /**
     * Address of the lock manager contract.
     */
    lockManagerAddress: string;
    /**
     * Address of the user.
     */
    address: string;
    /**
     * Amount of tokens in WEI format to be locked / unlocked.
     */
    amount?: bigint;
}
