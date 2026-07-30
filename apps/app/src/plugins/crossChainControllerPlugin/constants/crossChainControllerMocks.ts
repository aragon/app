import { PluginInterfaceType } from '@/shared/api/daoService';
import type { IBackendApiMock } from '@/shared/types';
import type { IChainConfig, ICrossChainControllerPlugin } from '../types';

const mockControllerAddress = '0xCCc00000000000000000000000000000000000cc';

const mockAdapterAddress = '0xADa00000000000000000000000000000000000da';

/**
 * Lanes the mocked controller is configured for. Deliberately spans several networks plus one chain
 * id the app has no network definition for (BNB Chain, 56), so the destination-chain selector can be
 * exercised for any DAO — the DAO's own chain is filtered out by the action itself.
 */
const mockControllerConfig: IChainConfig[] = [
    {
        chainId: 1,
        localAdapter: mockAdapterAddress,
        remoteAdapter: mockAdapterAddress,
    },
    {
        chainId: 137,
        localAdapter: mockAdapterAddress,
        remoteAdapter: mockAdapterAddress,
    },
    {
        chainId: 8453,
        localAdapter: mockAdapterAddress,
        remoteAdapter: mockAdapterAddress,
    },
    {
        chainId: 42_161,
        localAdapter: mockAdapterAddress,
        remoteAdapter: mockAdapterAddress,
    },
    {
        chainId: 11_155_111,
        localAdapter: mockAdapterAddress,
        remoteAdapter: mockAdapterAddress,
    },
    {
        chainId: 56,
        localAdapter: mockAdapterAddress,
        remoteAdapter: mockAdapterAddress,
    },
];

/**
 * Cross-chain controller installation injected into every DAO while the `useMocks` flag is on, so
 * the `forwardMessage` action can be composed before the plugin is indexed by the backend.
 *
 * `daoAddress` is intentionally left unset: `actionComposerUtils.getDaoPluginActions` keeps plugins
 * without one, which is what makes the mock apply to whichever DAO is opened. `isProcess` / `isBody`
 * are false so it is not offered as a governance process or body.
 */
export const crossChainControllerMockPlugin: ICrossChainControllerPlugin = {
    address: mockControllerAddress,
    name: 'Cross-chain controller (mock)',
    subdomain: 'cross-chain-controller',
    interfaceType: PluginInterfaceType.CROSS_CHAIN_CONTROLLER,
    release: '1',
    build: '1',
    isProcess: false,
    isBody: false,
    isSubPlugin: false,
    slug: 'ccc',
    blockTimestamp: 0,
    transactionHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    settings: {
        pluginAddress: mockControllerAddress,
        controllerConfig: mockControllerConfig,
    },
};

/**
 * Mock for `GET /plugins/by-dao/:network/:address/details`. Appends the cross-chain controller to
 * the DAO's real plugin list instead of replacing it, so every other plugin keeps working.
 */
export const crossChainControllerMocks: IBackendApiMock[] = [
    {
        url: /\/plugins\/by-dao\/[\w-]+\/0x[a-fA-F0-9]{40}\/details(?:$|[/?])/,
        type: 'merge',
        data: [crossChainControllerMockPlugin],
    },
];
