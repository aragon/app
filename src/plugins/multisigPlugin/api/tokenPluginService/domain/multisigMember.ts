export interface IMultisigMember {
    /**
     * Address of the member.
     */
    address: string;
    /**
     * ENS name linked to the member address.
     */
    ens: string | null;
}
