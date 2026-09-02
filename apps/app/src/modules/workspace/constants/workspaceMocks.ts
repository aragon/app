import { Network } from '@/shared/api/daoService';
import {
    type IWorkspace,
    WorkspaceAccountType,
} from '../api/workspaceService/domain';

/**
 * Hardcoded workspaces served by the mocked workspace API until a real workspace registry exists.
 *
 * There is no backend endpoint for workspaces yet, so `workspaceService` resolves them from this map instead of
 * issuing an HTTP request. The `useMocks` fetch interceptor is not usable here because it only patches `global.fetch`
 * from the client-side providers, which would leave the server-side prefetch in the page components unmocked.
 *
 * Keyed by workspace ID, i.e. the `workspaceId` URL parameter.
 */
export const workspaceMocks: Record<string, IWorkspace> = {
    demo: {
        id: 'demo',
        name: 'Demo Workspace',
        description:
            'A mocked workspace aggregating assets and transactions across two DAO accounts on different networks.',
        avatar: null,
        links: [],
        accounts: [
            {
                id: 'citrea-mainnet-0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
                type: WorkspaceAccountType.DAO,
                address: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
                network: Network.CITREA_MAINNET,
            },
            {
                id: 'ethereum-sepolia-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
                type: WorkspaceAccountType.DAO,
                address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
                network: Network.ETHEREUM_SEPOLIA,
            },
        ],
    },
};
