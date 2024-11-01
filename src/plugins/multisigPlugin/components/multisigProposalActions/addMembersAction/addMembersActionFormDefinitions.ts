export interface IAddOrRemoveMembersActionFormData {
    /**
     * The address to be added to the members/
     */
    members: Array<{ address: string }>;
}
