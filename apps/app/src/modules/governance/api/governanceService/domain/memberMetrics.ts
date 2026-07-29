export interface IMemberMetrics {
    /**
     * Unix-seconds timestamp of the member's first observed activity.
     */
    firstActivityTimestamp: number | null;
    /**
     * Unix-seconds timestamp of the member's most recent observed activity.
     */
    lastActivityTimestamp: number | null;
}
