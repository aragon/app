import {
    type IWorkspaceGateHolder,
    WorkspaceAccountType,
} from '../../api/workspaceService';

export const generateWorkspaceGateHolder = (
    holder?: Partial<IWorkspaceGateHolder>,
): IWorkspaceGateHolder => ({
    address: '0x0000000000000000000000000000000000000000',
    type: WorkspaceAccountType.DAO,
    ref: null,
    ...holder,
});
