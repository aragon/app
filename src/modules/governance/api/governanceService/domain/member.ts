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
}
