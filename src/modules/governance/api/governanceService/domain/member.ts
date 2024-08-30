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
     * Date of the first activity.
     */
    firstActivity: number | null;
    /**
     * Date of the last activity.
     */
    lastActivity: number | null;
}
