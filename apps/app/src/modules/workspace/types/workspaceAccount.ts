import type {
    IWorkspaceGate,
    WorkspaceAccountType,
} from '../api/workspaceService';

export interface IWorkspaceAccountTarget {
    /**
     * Address of the target the account has access to.
     */
    address: string;
    /**
     * Gates of the target held by the account.
     */
    gates: IWorkspaceGate[];
    /**
     * Number of distinct function selectors the account can call on the target.
     */
    capabilityCount: number;
}

export interface IWorkspaceAccount {
    /**
     * Address of the account.
     */
    address: string;
    /**
     * What the account turned out to be.
     */
    type: WorkspaceAccountType;
    /**
     * Reference to the entity resolved for the account, null when it could not be resolved.
     */
    ref: string | null;
    /**
     * Targets the account has access to.
     */
    targets: IWorkspaceAccountTarget[];
    /**
     * Total number of gates the account holds across all targets.
     */
    gateCount: number;
    /**
     * Total number of distinct function selectors the account can call across all targets.
     */
    capabilityCount: number;
}
