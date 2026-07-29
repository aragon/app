export interface ITokenPluginSettingsEscrowSettings {
    /**
     * The minimum amount required to lock.
     */
    minDeposit: string;
    /**
     * The minimum lock time before unlocking is available.
     */
    minLockTime: number;
    /**
     * The time in seconds between unlock and withdrawal.
     */
    cooldown: number;
    /**
     * The maximum time the voting power can increase.
     */
    maxTime: number;
    /**
     * The linear coefficient used to calculate the voting power increase over time.
     */
    slope: number;
    /**
     * The constant coefficient used to calculate the voting power increase over time.
     */
    bias: number;
    /**
     * Maximum exit fee percentage (basis points: 0-10000). Used for dynamic exit queue.
     */
    feePercent?: number;
    /**
     * Minimum exit fee percentage (basis points: 0-10000). Used for dynamic exit queue.
     */
    minFeePercent?: number;
    /**
     * Minimum cooldown period for early withdrawal (seconds). Used for dynamic exit queue.
     */
    minCooldown?: number;
}
