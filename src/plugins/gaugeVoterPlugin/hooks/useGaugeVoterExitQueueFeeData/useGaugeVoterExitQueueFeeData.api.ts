import type { IGaugeVoterExitQueueTicket } from '../../types/gaugeVoterExitQueueTicket';

export interface ITicketData {
    /**
     * Address that holds the ticket.
     */
    holder: `0x${string}`;
    /**
     * Timestamp when exit was queued (in seconds).
     */
    queuedAt: number;
    /**
     * Minimum cooldown period in seconds (v2 only, falls back to global).
     */
    minCooldown?: number;
    /**
     * Full cooldown period in seconds (v2 only, falls back to global).
     */
    cooldown?: number;
    /**
     * Maximum/early exit fee in basis points (v2 only, falls back to global).
     */
    feePercent?: number;
    /**
     * Minimum fee after full cooldown in basis points (v2 only, falls back to global).
     */
    minFeePercent?: number;
    /**
     * Fee decay slope for dynamic fees (v2 only).
     */
    slope?: bigint;
}

export interface IUseGaugeVoterExitQueueFeeDataParams {
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
    /**
     * Refetch interval in milliseconds. If provided, the hook will poll the contract at this interval.
     */
    refetchInterval?: number;
}

export interface IUseGaugeVoterExitQueueFeeDataReturn {
    /**
     * Ticket information containing fee parameters.
     */
    ticket: IGaugeVoterExitQueueTicket | undefined;
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
