import {
    type IWorkspaceGate,
    WorkspaceGateRequirement,
} from '../../api/workspaceService';

export const generateWorkspaceGate = (
    gate?: Partial<IWorkspaceGate>,
): IWorkspaceGate => ({
    requirement: WorkspaceGateRequirement.OWNER,
    role: null,
    roleName: null,
    inferred: false,
    holders: [],
    selectors: [],
    ...gate,
});
