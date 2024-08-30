export interface IMember {
    /**
     * Address of the member.
     */
    address: string;
    /**
     * ENS name linked to the member address.
     */
    ens: string | null;
    /**
     * Type of the member.
     */
    type: string;
    /**
     * Block timestamp of the first activity.
     */
    firstActivity: number | null;
    /**
     * Block timestamp of the latest activity.
     */
    lastActivity: number | null;
}
