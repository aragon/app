import type { WorkspaceAccountType } from './enum';

export interface IWorkspaceGateHolder {
    /**
     * Address holding the gate.
     */
    address: string;
    /**
     * What the address turned out to be.
     */
    type: WorkspaceAccountType;
    /**
     * DAO name or plugin interface type, null when there is nothing to name.
     */
    ref: string | null;
}
