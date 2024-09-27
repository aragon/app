export interface IMemberMetrics {
    /**
     * Block timestamp of the first activity of the member in seconds.
     */
    firstActivity: number | null;
    /**
     * Block timestamp of the latest activity of the member in seconds.
     */
    lastActivity: number | null;
}
