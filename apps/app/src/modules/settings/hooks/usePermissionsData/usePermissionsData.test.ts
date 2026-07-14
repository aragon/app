import { act, renderHook } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import { type IDao, Network } from '@/shared/api/daoService';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import * as useDaoPluginsModule from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoMetrics,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { permissionsPreviewAccounts } from '../../constants/permissionsPreviewData';
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

    it('uses the Patito preview identity when the mocks flag is on', () => {
        setFeatureFlags({ useMocks: true });

        const { result } = renderHook(() =>
            usePermissionsData({ daoId: 'any-dao' }),
        );

        expect(result.current.accounts).toEqual(permissionsPreviewAccounts);
        expect(result.current.dao?.name).toBe('Patito DAO');
    });
});
