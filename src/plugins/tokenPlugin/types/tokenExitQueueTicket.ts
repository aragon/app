import type { Hex } from 'viem';

export interface ITokenExitQueueTicket {
    /**
     * Address of the ticket holder.
     */
    holder: Hex;
    /**
     * Timestamp when the ticket was queued (in seconds).
     */
    queuedAt: number;
    /**
     * Minimum cooldown period at the time of queuing (in seconds).
     * This is the minimum time the user must wait before any exit is allowed.
     */
    minCooldown: number;
    /**
     * Full cooldown period at the time of queuing (in seconds).
     * After this time, the minimum fee applies.
     */
    cooldown: number;
    /**
     * Maximum/base fee percent at the time of queuing (in basis points, 0-10000).
     * In Dynamic mode: fee immediately after minCooldown.
     * In Tiered mode: early exit fee.
     * In Fixed mode: the only fee.
     */
    feePercent: number;
    /**
     * Minimum fee percent at the time of queuing (in basis points, 0-10000).
     * In Dynamic mode: fee after full cooldown.
     * In Tiered mode: normal exit fee.
     * In Fixed mode: same as feePercent.
     */
    minFeePercent: number;
    /**
     * Fee decrease rate per second (in internal precision 1e18).
     * Set to 0 for Tiered and Fixed modes (no decay).
     * Non-zero for Dynamic mode (linear decay).
     */
    slope: bigint;
}
