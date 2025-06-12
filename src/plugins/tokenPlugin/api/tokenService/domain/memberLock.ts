export interface IMemberLock {
    /**
     * Unique identifier for the member lock.
     */
    id: string;
    /**
     * ID of the received NFT (emitted by the Deposit event).
     */
    tokenId: string;
    /**
     * Timestamp of the lock epoch (emitted by the Deposit event). Measured in seconds.
     */
    epochStartAt: number;
    /**
     * Amount of tokens locked (emitted by the Deposit event).
     */
    amount: string;
    /**
     * Current voting power of the lock.
     */
    votingPower: string;
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
