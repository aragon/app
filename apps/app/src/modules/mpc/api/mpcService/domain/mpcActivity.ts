export type MpcActivityType =
    | 'system_created'
    | 'key_registered'
    | 'recovery_acknowledged'
    | 'policy_updated'
    | 'member_added'
    | 'member_removed'
    | 'request_created'
    | 'request_updated'
    | 'request_approved'
    | 'request_rejected'
    | 'share_released'
    | 'request_signed'
    | 'request_broadcast'
    | 'request_failed'
    | 'reshare_completed'
    | 'recovery_completed'
    | 'key_exported'
    | 'system_deleted';

export interface IMpcActivity {
    /**
     * Unique identifier of the activity entry.
     */
    id: string;
    /**
     * System the entry belongs to.
     */
    systemId: string;
    /**
     * Timestamp (ISO 8601).
     */
    at: string;
    /**
     * Username of the actor ("system" for automatic entries).
     */
    actor: string;
    /**
     * Type of the activity.
     */
    type: MpcActivityType;
    /**
     * Additional structured data.
     */
    data?: Record<string, unknown>;
}
