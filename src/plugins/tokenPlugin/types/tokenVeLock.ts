export interface ITokenVeLock {
    /**
     * Lock entity ID.
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
     *
     */
    lockExit: {
        status: boolean;
        exitDateAt: number | null;
    };
}
