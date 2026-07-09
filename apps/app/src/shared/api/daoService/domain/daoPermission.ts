export interface IDaoPermission {
    /**
     * Pemission ID. keccak256 hash of a permission string.
     */
    permissionId: string;
    /**
     * Who (is granted).
     */
    whoAddress: string;
    /**
     * Where/target.
     */
    whereAddress: string;
    /**
     * `condition` param from `Granted` event.
     * The address `ALLOW_FLAG` for regular permissions or, alternatively, the
     * `IPermissionCondition` contract implementation to be used.
     */
    conditionAddress: string;
}
