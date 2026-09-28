import type {
    Network,
    PermissionEntityExternalBrandId,
    PermissionEntityLayer,
    PermissionEntityRole,
    PermissionEntityStatus,
} from './enum';

export interface ISppConditionRule {
    type:
        | 'block-number'
        | 'timestamp'
        | 'condition'
        | 'logic'
        | 'value'
        | 'unknown';
    operation:
        | 'none'
        | 'eq'
        | 'neq'
        | 'gt'
        | 'lt'
        | 'gte'
        | 'lte'
        | 'return'
        | 'not'
        | 'and'
        | 'or'
        | 'xor'
        | 'if-else'
        | 'unknown';
    value: string;
    permissionId: string;
    ruleIndexes?: number[];
    conditionAddress?: string;
}

/**
 * Backend-enriched condition payload for a permission. Fields vary by
 * condition type (voting-power, membership, execute-selector, or unknown).
 */
export interface IDaoPermissionCondition {
    /**
     * Backend condition discriminator, e.g. `voting-power`, `membership`,
     * `execute-selector`, or `unknown`.
     */
    conditionType: string;
    /**
     * Token contract address used by token-based conditions.
     */
    token?: string;
    /**
     * Minimum token voting power required by voting-power conditions.
     */
    minVotingPower?: string;
    /**
     * Whether membership conditions only allow listed accounts.
     */
    onlyListed?: boolean;
    /**
     * Minimum number of approvals required by approval-threshold conditions.
     */
    minApprovals?: number;
    /**
     * Untrusted backend payload, narrowed by the execute-selector slot.
     */
    selectors?: unknown;
    /**
     * Untrusted backend payload, narrowed by the execute-selector slot.
     */
    targets?: unknown;
    /**
     * Normalized rules returned for SPP rule conditions.
     */
    rules?: ISppConditionRule[];
}

/**
 * Backend-enriched display metadata for a permission actor (who), target
 * (where), or condition contract.
 */
export interface IPermissionEntityRef {
    /**
     * Entity contract or account address.
     */
    address: string;
    /**
     * Backend classification used to group DAO, plugin, condition, and external
     * actors.
     */
    layer: PermissionEntityLayer;
    /**
     * Human-readable backend label, when the backend can resolve one.
     */
    label?: string;
    /**
     * Plugin or contract interface identifier returned by the backend.
     */
    interfaceType?: string;
    /**
     * Lifecycle status for plugin-like entities.
     */
    status?: PermissionEntityStatus;
    /**
     * Parent plugin address for nested or process-internal entities.
     */
    parentPluginAddress?: string;
    /**
     * Parent plugin display name for nested or process-internal entities.
     */
    parentPluginName?: string;
    /**
     * Parent plugin interface identifier for nested or process-internal
     * entities.
     */
    parentInterfaceType?: string;
    /**
     * SPP stage index for process-internal entities.
     */
    stageIndex?: number;
    /**
     * Permission-side role this entity belongs to.
     */
    role?: PermissionEntityRole;
    /**
     * Avatar URL resolved by the backend.
     */
    avatarSrc?: string;
    /**
     * External voting-body brand identity, mirrored from the backend permission
     * entity enrichment (see app-backend #1491). `safe` marks a Safe-based
     * process body or external proposer.
     */
    brandId?: PermissionEntityExternalBrandId;
    /**
     * Address of the proposal-creation condition wired to a Safe body, when the
     * backend can resolve it.
     */
    proposalCreationConditionAddress?: string;
}

export interface IDaoPermission {
    /**
     * Permission ID. keccak256 hash of a permission string.
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
    conditionAddress?: string;
    /**
     * Enriched condition details returned by the backend when available.
     */
    condition?: IDaoPermissionCondition;
    /**
     * Backend-enriched display metadata for the permission actor.
     */
    who?: IPermissionEntityRef;
    /**
     * Backend-enriched display metadata for the permission target.
     */
    where?: IPermissionEntityRef;
    /**
     * Backend-enriched display metadata for the permission condition contract.
     */
    conditionEntity?: IPermissionEntityRef;
    /**
     * Network of the DAO permission event.
     */
    network?: Network;
}
