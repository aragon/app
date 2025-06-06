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
     * The coefficient used to calculate the voting power increase over time.
     */
    slope: number;
}
