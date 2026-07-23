import { act, renderHook } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import { type IDao, type IDaoPlugin, Network } from '@/shared/api/daoService';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import * as useDaoPluginsModule from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoMetrics,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { usePermissionsData } from './usePermissionsData';

describe('usePermissionsData hook', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useAllDaoPermissionsSpy = jest.spyOn(
        daoService,
        'useAllDaoPermissions',
    );
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsModule, 'useDaoPlugins');
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    const setFeatureFlags = (enabled: Record<string, boolean>) => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: (key: string) => enabled[key] ?? false,
        } as ReturnType<typeof featureFlagsProvider.useFeatureFlags>);
    };

    const setDao = (dao?: Partial<IDao>) => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao(dao),
            }) as ReturnType<typeof daoService.useDao>,
        );
    };

    beforeEach(() => {
        setFeatureFlags({});
        setDao();
        useAllDaoPermissionsSpy.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as ReturnType<typeof daoService.useAllDaoPermissions>);
        useDaoPluginsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('re-queries permissions with the selected account params on switch', () => {
        setFeatureFlags({ linkedAccount: true });
        setDao({
            id: 'main-dao',
            address: '0xMainAddress',
            network: Network.ETHEREUM_MAINNET,
            name: 'Main DAO',
            linkedAccounts: [
                {
                    id: 'linked-1',
                    address: '0xLinkedAddress',
                    network: Network.POLYGON_MAINNET,
                    name: 'Linked Treasury',
                    description: '',
                    ens: null,
                    subdomain: null,
                    avatar: null,
                    metrics: generateDaoMetrics(),
                    links: [],
                    blockTimestamp: 0,
                    transactionHash: '',
                },
            ],
        });

        const { result } = renderHook(() =>
            usePermissionsData({ daoId: 'main-dao' }),
        );

        expect(useAllDaoPermissionsSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    daoAddress: '0xMainAddress',
                },
            }),
            expect.anything(),
        );

        act(() => {
            result.current.setSelectedAccountId('linked-1');
        });

        expect(useAllDaoPermissionsSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                urlParams: {
                    network: Network.POLYGON_MAINNET,
                    daoAddress: '0xLinkedAddress',
                },
            }),
            expect.anything(),
        );
    });

    it('uses backend dao data when the mocks flag is on', () => {
        setFeatureFlags({ useMocks: true });
        setDao({
            id: 'main-dao',
            address: '0xMainAddress',
            network: Network.ETHEREUM_MAINNET,
            name: 'Main DAO',
        });

        const { result } = renderHook(() =>
            usePermissionsData({ daoId: 'main-dao' }),
        );

        expect(result.current.accounts).toEqual([
            expect.objectContaining({
                daoAddress: '0xMainAddress',
                name: 'Main DAO',
            }),
        ]);
        expect(result.current.dao?.name).toBe('Main DAO');
    });

    it('loads subplugins for permission graph filtering', () => {
        renderHook(() => usePermissionsData({ daoId: 'main-dao' }));

        expect(useDaoPluginsSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                daoId: 'main-dao',
                includeLinkedAccounts: true,
                includeSubPlugins: true,
            }),
        );
    });

    it('only exposes plugin metadata for the selected account', () => {
        setFeatureFlags({ linkedAccount: true });
        setDao({
            id: 'main-dao',
            address: '0xMainAddress',
            network: Network.ETHEREUM_MAINNET,
            name: 'Main DAO',
            linkedAccounts: [
                {
                    id: 'linked-1',
                    address: '0xLinkedAddress',
                    network: Network.POLYGON_MAINNET,
                    name: 'Linked Treasury',
                    description: '',
                    ens: null,
                    subdomain: null,
                    avatar: null,
                    metrics: generateDaoMetrics(),
                    links: [],
                    blockTimestamp: 0,
                    transactionHash: '',
                },
            ],
        });
        const rootPlugin = generateFilterComponentPlugin<IDaoPlugin, object>({
            uniqueId: 'root-plugin',
            meta: generateDaoPlugin({
                address: '0xRootPlugin',
                daoAddress: '0xMainAddress',
            }),
        });
        const legacyRootPlugin = generateFilterComponentPlugin<
            IDaoPlugin,
            object
        >({
            uniqueId: 'legacy-root-plugin',
            meta: generateDaoPlugin({
                address: '0xLegacyRootPlugin',
                daoAddress: undefined,
            }),
        });
        const linkedPlugin = generateFilterComponentPlugin<IDaoPlugin, object>({
            uniqueId: 'linked-plugin',
            meta: generateDaoPlugin({
                address: '0xLinkedPlugin',
                daoAddress: '0xLinkedAddress',
            }),
        });
        useDaoPluginsSpy.mockReturnValue([
            rootPlugin,
            legacyRootPlugin,
            linkedPlugin,
        ]);

        const { result } = renderHook(() =>
            usePermissionsData({ daoId: 'main-dao' }),
        );

        expect(
            result.current.daoPlugins?.map((plugin) => plugin.uniqueId),
        ).toEqual(['root-plugin', 'legacy-root-plugin']);

        act(() => {
            result.current.setSelectedAccountId('linked-1');
        });

        expect(
            result.current.daoPlugins?.map((plugin) => plugin.uniqueId),
        ).toEqual(['linked-plugin']);
    });
});
