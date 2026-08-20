import { Network } from '@/shared/api/daoService';
import { type IWorkspace, WorkspaceStatus } from '../../api/workspaceService';

export const generateWorkspace = (
    workspace?: Partial<IWorkspace>,
): IWorkspace => ({
    id: 'workspace-id',
    name: 'workspace',
    title: null,
    description: null,
    logo: null,
    creator: '0x0000000000000000000000000000000000000000',
    network: Network.ETHEREUM_MAINNET,
    status: WorkspaceStatus.READY,
    targets: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    ...workspace,
});
