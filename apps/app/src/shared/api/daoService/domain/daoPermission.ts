import type { Network } from './enum';

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

export type PermissionEntityLayer =
    | 'dao'
    | 'topLevelPlugin'
    | 'processInternal'
    | 'condition'
    | 'externalActor'
    | 'historicalPlugin'
    | 'contract'
    | 'unknown';

export interface IPermissionEntityRef {
    address: string;
    layer: PermissionEntityLayer;
    label?: string;
    interfaceType?: string;
    status?: 'installed' | 'uninstalled' | 'historical' | 'unknown';
    parentPluginAddress?: string;
    parentPluginName?: string;
    parentInterfaceType?: string;
    stageIndex?: number;
    role?: 'who' | 'where' | 'condition';
    avatarSrc?: string;
    /**
     * Governance body brand identity, mirrored from the backend permission
     * entity enrichment (see app-backend #1491). `safe` marks a Safe-based
     * process body or external proposer.
     */
    brandId?: 'eoa' | 'safe' | 'other';
    /**
     * Address of the proposal-creation condition wired to a Safe body, when the
     * backend can resolve it.
     */
    proposalCreationConditionAddress?: string;
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
