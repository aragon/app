import type { ILockExit } from './lockExit';
import type { ILockNft } from './lockNft';

export interface IMemberLock {
    /**
     * Unique identifier for the member lock.
     */
    id: string;
    /**
     * ID of the token being locked.
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
    lockExit: ILockExit;
    /**
     * VE NFT details.
     */
    nft: ILockNft;
}
