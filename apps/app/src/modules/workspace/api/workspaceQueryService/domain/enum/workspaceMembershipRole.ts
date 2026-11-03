/**
 * Role a member holds on a workspace account. Values match the backend response.
 */
export enum WorkspaceMembershipRole {
    /**
     * Member of a governance plugin of a DAO account.
     */
    MEMBER = 'member',
    /**
     * Owner of a Safe account.
     */
    OWNER = 'owner',
}
