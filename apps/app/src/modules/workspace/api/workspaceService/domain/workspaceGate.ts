import type { WorkspaceGateRequirement } from './enum';
import type { IWorkspaceGateHolder } from './workspaceGateHolder';
import type { IWorkspaceGateSelector } from './workspaceGateSelector';

export interface IWorkspaceGate {
    /**
     * Requirement enforced by the gate.
     */
    requirement: WorkspaceGateRequirement;
    /**
     * Role hash required by the gate, null for gates not based on a role.
     */
    role: string | null;
    /**
     * Human-readable name of the role, null when no public getter exposes it.
     */
    roleName: string | null;
    /**
     * Whether the requirement was deduced from who could call the function rather than read out of
     * a revert, which is good evidence but not proof.
     */
    inferred: boolean;
    /**
     * Accounts that satisfy the gate right now. Empty means gated but nobody found. Direct holders
     * only, so an account that could grant itself the role is not listed.
     */
    holders: IWorkspaceGateHolder[];
    /**
     * Function selectors protected by the gate.
     */
    selectors: IWorkspaceGateSelector[];
}
