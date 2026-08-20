import type { IWorkspaceGateSelector } from '../../api/workspaceService';

export const generateWorkspaceGateSelector = (
    selector?: Partial<IWorkspaceGateSelector>,
): IWorkspaceGateSelector => ({
    selector: '0x00000000',
    signature: 'transferOwnership(address)',
    ...selector,
});
