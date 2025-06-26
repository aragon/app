export interface ILockExit {
    /**
     * Whether the lock is currently in cooldown or not.
     */
    status: boolean;
    /**
     * Timestamp when the lock will be available for withdrawal. Measured in seconds.
     */
    exitDateAt: number | null;
}
