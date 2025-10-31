import type { ILockToVoteTicket } from '../../types';

export interface IUseLockToVoteFeeDataParams {
    /**
     * Token ID for the NFT lock.
     */
    tokenId: bigint;
    /**
     * Address of the lock manager contract (DynamicExitQueue).
     */
    lockManagerAddress: string;
    /**
     * Chain ID for the network.
     */
    chainId: number;
    /**
     * Whether the hook should be enabled.
     */
    enabled?: boolean;
}

export interface IUseLockToVoteFeeDataReturn {
    /**
     * Ticket information containing fee parameters.
     */
    ticket: ILockToVoteTicket | undefined;
    /**
     * Current fee amount (in wei) calculated by the contract.
     */
    feeAmount: bigint;
    /**
     * Whether the user can exit (minCooldown has passed).
     */
    canExit: boolean;
    /**
     * Whether the full cooldown has passed (minimum fee applies).
     */
    isCool: boolean;
    /**
     * Whether any of the contract reads are loading.
     */
    isLoading: boolean;
    /**
     * Refetch all fee data.
     */
    refetch: () => Promise<unknown>;
}
