import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceDetails,
    WorkspaceStatus,
} from '../../api/workspaceService';

export const generateWorkspaceDetails = (
    workspace?: Partial<IWorkspaceDetails>,
): IWorkspaceDetails => ({
    id: 'workspace-id',
    name: 'workspace',
    title: null,
    description: null,
    logo: null,
    creator: '0x0000000000000000000000000000000000000000',
    network: Network.ETHEREUM_MAINNET,
    status: WorkspaceStatus.READY,
    error: null,
    counts: { targets: 0, gates: 0, accounts: 0, capabilities: 0 },
    targets: [],
    ...workspace,
});
