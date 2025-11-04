export interface ILockExit {
    /**
     * Whether the lock is currently queued for exit.
     */
    status: boolean;
    /**
     * Timestamp when the exit was queued (from ticket.queuedAt). Measured in seconds.
     */
    queuedAt?: number;
    /**
     * Minimum cooldown period from ticket (in seconds).
     * Time user must wait before withdrawal is possible.
     */
    minCooldown?: number;
    /**
     * Full cooldown period from ticket (in seconds).
     * Time when minimum fee applies.
     */
    cooldown?: number;
    /**
     * Maximum/early exit fee from ticket (basis points, 0-10000).
     */
    feePercent?: number;
    /**
     * Minimum fee after full cooldown from ticket (basis points, 0-10000).
     */
    minFeePercent?: number;
    /**
     * Fee decay slope from ticket (for dynamic fees).
     */
    slope?: string;
    /**
     * @deprecated Use queuedAt + minCooldown instead. Will be removed in future.
     */
    exitDateAt: number | null;
}
