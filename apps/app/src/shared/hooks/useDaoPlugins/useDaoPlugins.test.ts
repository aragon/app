import { renderHook } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useDaoPlugins } from './useDaoPlugins';

const useDaoOverridesMock = jest.fn(() => ({ data: undefined }));

jest.mock('@/shared/api/cmsService', () => ({
    useDaoOverrides: () => useDaoOverridesMock(),
}));

describe('useDaoPlugins hook', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');

    afterEach(() => {
        useDaoSpy.mockReset();
        getDaoPluginsSpy.mockReset();
        useDaoOverridesMock.mockReturnValue({ data: undefined });
    });

    it('retrieves the DAO plugins and returns them as tab-plugins', () => {
        const plugins = [
            generateDaoPlugin({
                interfaceType: PluginInterfaceType.MULTISIG,
                subdomain: 'multisig',
                address: '0x123',
                slug: 'multi',
            }),
            generateDaoPlugin({
                interfaceType: PluginInterfaceType.TOKEN_VOTING,
                subdomain: 'token-voting',
                address: '0x456',
                slug: 'token',
            }),
        ];
        const dao = generateDao({ id: 'test', plugins });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        getDaoPluginsSpy.mockReturnValue(plugins);
        const { result } = renderHook(() => useDaoPlugins({ daoId: dao.id }), {
            wrapper: FeatureFlagsProvider,
        });

        expect(result.current).toEqual([
            {
                id: 'tokenVoting',
                uniqueId: `${plugins[1].address}-${plugins[1].slug}`,
                label: 'Token Voting',
                meta: plugins[1],
                props: {},
            },
            {
                id: 'multisig',
                uniqueId: `${plugins[0].address}-${plugins[0].slug}`,
                label: 'Multisig',
                meta: plugins[0],
                props: {},
            },
        ]);
    });

    it('filters the plugins by the type or address when specified', () => {
        const type = PluginType.BODY;
        const pluginAddress = '0x572983';
        const dao = generateDao({
            plugins: [
                generateDaoPlugin({
                    interfaceType: PluginInterfaceType.SPP,
                    address: '0x123',
                }),
            ],
        });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );

        renderHook(
            () => useDaoPlugins({ daoId: dao.id, type, pluginAddress }),
            {
                wrapper: FeatureFlagsProvider,
            },
        );
        expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, {
            type,
            pluginAddress,
        });
    });

    it('hides plugins listed in the DAO override when visibleOnly is true', () => {
        const hiddenPlugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            address: '0xhidden',
            slug: 'token',
        });
        const visiblePlugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            address: '0xvisible',
            slug: 'multi',
        });
        const plugins = [hiddenPlugin, visiblePlugin];
        const dao = generateDao({ id: 'test', plugins });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        getDaoPluginsSpy.mockReturnValue(plugins);
        useDaoOverridesMock.mockReturnValue({
            data: { test: { pluginsToHide: [{ address: '0xhidden' }] } },
        } as never);

        const { result } = renderHook(
            () => useDaoPlugins({ daoId: dao.id, visibleOnly: true }),
            { wrapper: FeatureFlagsProvider },
        );

        expect(result.current?.map((plugin) => plugin.meta.address)).toEqual([
            '0xvisible',
        ]);
    });

    it('keeps hidden plugins in the canonical list when visibleOnly is not set', () => {
        const hiddenPlugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            address: '0xhidden',
            slug: 'token',
        });
        const plugins = [hiddenPlugin];
        const dao = generateDao({ id: 'test', plugins });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        getDaoPluginsSpy.mockReturnValue(plugins);
        useDaoOverridesMock.mockReturnValue({
            data: { test: { pluginsToHide: [{ address: '0xhidden' }] } },
        } as never);

        const { result } = renderHook(() => useDaoPlugins({ daoId: dao.id }), {
            wrapper: FeatureFlagsProvider,
        });

        expect(result.current?.map((plugin) => plugin.meta.address)).toEqual([
            '0xhidden',
        ]);
    });

    it('filters the plugins by those with full execute when hasExecute is true', () => {
        const hasExecute = true;
        const dao = generateDao({
            plugins: [
                generateDaoPlugin({
                    interfaceType: PluginInterfaceType.MULTISIG,
                    conditionAddress: '0x123',
                }),
            ],
        });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );

        renderHook(() => useDaoPlugins({ daoId: dao.id, hasExecute }), {
            wrapper: FeatureFlagsProvider,
        });
        expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, { hasExecute });
    });
});
