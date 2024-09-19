export interface IAddressInfo {
    /**
     * Address of the struct.
     */
    address: string;
    /**
     * ENS linked to the address.
     */
    ens: string | null;
    /**
     * Avatar linked to the address.
     */
    avatar: string | null;
}
