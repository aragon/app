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
     * Amount of tokens locked (emitted by the Deposit event).
     */
    amount: string;
    /**
     *
     */
    lockExit: {
        status: boolean;
        exitDateAt: number | null;
    };
}
