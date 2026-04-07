import { renderHook } from '@testing-library/react';
import type { IDaoPlugin } from '@/shared/api/daoService';
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
import { compareFilterPlugins, useDaoPlugins } from './useDaoPlugins';

jest.mock('@/shared/api/cmsService', () => ({
    useDaoOverrides: () => ({ data: undefined }),
}));

describe('useDaoPlugins hook', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');

    afterEach(() => {
        useDaoSpy.mockReset();
        getDaoPluginsSpy.mockReset();
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

describe('compareFilterPlugins', () => {
    const ROOT_DAO_ADDRESS = '0xRoot';

    const buildFilterPlugin = (plugin: Partial<IDaoPlugin>) => ({
        id: plugin.interfaceType ?? PluginInterfaceType.UNKNOWN,
        uniqueId: `${plugin.address ?? '0x0'}-${plugin.slug ?? 'slug'}`,
        label: '',
        meta: generateDaoPlugin(plugin),
        props: {},
    });

    it('sorts root-DAO plugins before sub-plugins of the same type', () => {
        const root = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: false,
        });
        const sub = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: true,
        });

        const sorted = [sub, root].sort((a, b) =>
            compareFilterPlugins(a, b, ROOT_DAO_ADDRESS),
        );
        expect(sorted).toEqual([root, sub]);
    });

    it('sorts root-DAO plugins before linked-account plugins of the same type', () => {
        const root = buildFilterPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: false,
        });
        const linked = buildFilterPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            daoAddress: '0xLinkedDao',
            isSubPlugin: false,
        });

        const sorted = [linked, root].sort((a, b) =>
            compareFilterPlugins(a, b, ROOT_DAO_ADDRESS),
        );
        expect(sorted).toEqual([root, linked]);
    });

    it('sorts by interface type priority: TOKEN_VOTING > MULTISIG > LOCK_TO_VOTE', () => {
        const lock = buildFilterPlugin({
            interfaceType: PluginInterfaceType.LOCK_TO_VOTE,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x3',
        });
        const multisig = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x2',
        });
        const token = buildFilterPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x1',
        });

        const sorted = [lock, multisig, token].sort((a, b) =>
            compareFilterPlugins(a, b, ROOT_DAO_ADDRESS),
        );
        expect(sorted.map((p) => p.meta.interfaceType)).toEqual([
            PluginInterfaceType.TOKEN_VOTING,
            PluginInterfaceType.MULTISIG,
            PluginInterfaceType.LOCK_TO_VOTE,
        ]);
    });

    it('sorts unknown/other interface types after listed types with priority 99', () => {
        const admin = buildFilterPlugin({
            interfaceType: PluginInterfaceType.ADMIN,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x1',
        });
        const lockToVote = buildFilterPlugin({
            interfaceType: PluginInterfaceType.LOCK_TO_VOTE,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x2',
        });

        const sorted = [admin, lockToVote].sort((a, b) =>
            compareFilterPlugins(a, b, ROOT_DAO_ADDRESS),
        );
        expect(sorted.map((p) => p.meta.interfaceType)).toEqual([
            PluginInterfaceType.LOCK_TO_VOTE,
            PluginInterfaceType.ADMIN,
        ]);
    });

    it('treats plugins with undefined daoAddress as non-root without throwing', () => {
        const root = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: false,
            address: '0x1',
        });
        const undefinedAddress = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            isSubPlugin: false,
            address: '0x2',
        });

        const sorted = [undefinedAddress, root].sort((a, b) =>
            compareFilterPlugins(a, b, ROOT_DAO_ADDRESS),
        );
        expect(sorted).toEqual([root, undefinedAddress]);
    });

    it('preserves original order for equal-priority plugins (stable sort)', () => {
        const first = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0xFirst',
        });
        const second = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0xSecond',
        });

        const sorted = [first, second].sort((a, b) =>
            compareFilterPlugins(a, b, ROOT_DAO_ADDRESS),
        );
        expect(sorted.map((p) => p.meta.address)).toEqual([
            '0xFirst',
            '0xSecond',
        ]);
    });

    it('sorts a mixed set: root by type, then non-root by type', () => {
        const rootToken = buildFilterPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: false,
            address: '0x1',
        });
        const rootMultisig = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: false,
            address: '0x2',
        });
        const linkedMultisig = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: '0xLinked',
            isSubPlugin: false,
            address: '0x3',
        });
        const subLock = buildFilterPlugin({
            interfaceType: PluginInterfaceType.LOCK_TO_VOTE,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: true,
            address: '0x4',
        });

        const sorted = [subLock, linkedMultisig, rootMultisig, rootToken].sort(
            (a, b) => compareFilterPlugins(a, b, ROOT_DAO_ADDRESS),
        );
        expect(sorted.map((p) => p.meta.address)).toEqual([
            '0x1',
            '0x2',
            '0x3',
            '0x4',
        ]);
    });
});
