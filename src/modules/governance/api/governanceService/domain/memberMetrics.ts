export interface IMemberMetrics {
    /**
     * Block number of the first activity of the member.
     */
    firstActivity: number | null;
    /**
     * Block number of the latest activity of the member.
     */
    lastActivity: number | null;
}
