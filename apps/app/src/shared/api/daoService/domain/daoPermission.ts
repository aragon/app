export interface IDaoPermissionCondition {
    /**
     * Backend condition discriminator, e.g. `voting-power`, `membership`,
     * `execute-selector`, or `unknown`.
     */
    conditionType: string;
    token?: string;
    minVotingPower?: string;
    onlyListed?: boolean;
    minApprovals?: number;
    selectors?: Array<string | null>;
    targets?: string[];
    [key: string]: unknown;
}

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
    /**
     * Enriched condition details returned by the backend when available.
     */
    condition?: IDaoPermissionCondition;
}
