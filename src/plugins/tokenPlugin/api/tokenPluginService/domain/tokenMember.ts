export interface ITokenMember {
    /**
     * Address of the member.
     */
    address: string;
    /**
     * ENS name linked to the member address.
     */
    ens: string | null;
    /**
     * Voting power of the member.
     */
    votingPower: string;
}
