export interface IMemberMetrics {
    /**
     * Block number of the first activity of the member in the given body plugin.
     */
    firstActivity: number | null;
    /**
     * Block number of the latest activity of the member in the given body plugin.
     */
    lastActivity: number | null;
}
