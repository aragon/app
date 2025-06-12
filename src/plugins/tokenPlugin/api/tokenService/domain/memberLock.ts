export interface IMemberLock {
    /**
     * Unique identifier for the member lock.
     */
    id: string;
    /**
     * ID of the lock.
     */
    tokenId: string;
    /**
     * Timestamp of the lock epoch in seconds.
     */
    epochStartAt: number;
    /**
     * Amount of tokens locked.
     */
    amount: string;
    /**
     * Lock exit details.
     */
    lockExit: {
        /**
         * Whether the lock is currently in cooldown or not.
         */
        status: boolean;
        /**
         * Timestamp when the lock will be available for withdrawal. Measured in seconds.
         */
        exitDateAt: number | null;
    };
    /**
     * VE NFT details.
     */
    nft: {
        /**
         * Name of the NFT contract.
         */
        name: string;
    };
}
