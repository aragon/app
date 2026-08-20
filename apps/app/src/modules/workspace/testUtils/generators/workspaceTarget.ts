import {
    type IWorkspaceTarget,
    WorkspaceTargetStatus,
} from '../../api/workspaceService';

export const generateWorkspaceTarget = (
    target?: Partial<IWorkspaceTarget>,
): IWorkspaceTarget => ({
    address: '0x0000000000000000000000000000000000000000',
    status: WorkspaceTargetStatus.DONE,
    schemes: [],
    owner: null,
    pendingOwner: null,
    authority: null,
    gates: [],
    error: null,
    ...target,
});
