import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceMember,
    type IWorkspaceMembership,
    WorkspaceMembershipRole,
} from '../../api/workspaceQueryService';

export const generateWorkspaceMembership = (
    membership?: Partial<IWorkspaceMembership>,
): IWorkspaceMembership => ({
    account: {
        network: Network.ETHEREUM_MAINNET,
        address: '0x0000000000000000000000000000000000000000',
    },
    governance: {
        address: '0x0000000000000000000000000000000000000001',
        type: 'multisig',
    },
    role: WorkspaceMembershipRole.MEMBER,
    ...membership,
});

export const generateWorkspaceMember = (
    member?: Partial<IWorkspaceMember>,
): IWorkspaceMember => ({
    network: Network.ETHEREUM_MAINNET,
    address: '0x0000000000000000000000000000000000000002',
    ens: null,
    avatar: null,
    memberships: [generateWorkspaceMembership()],
    ...member,
});
