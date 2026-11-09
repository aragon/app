import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';

export const generateWorkspaceAccount = (
    account?: Partial<IWorkspaceAccount>,
): IWorkspaceAccount => ({
    id: `${Network.ETHEREUM_MAINNET}-0x0000000000000000000000000000000000000000`,
    type: WorkspaceAccountType.DAO,
    address: '0x0000000000000000000000000000000000000000',
    network: Network.ETHEREUM_MAINNET,
    ...account,
});
