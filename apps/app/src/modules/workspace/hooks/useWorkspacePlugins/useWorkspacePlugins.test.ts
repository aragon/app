import { renderHook } from '@testing-library/react';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import * as useWorkspaceDaos from '../useWorkspaceDaos';
import { useWorkspacePlugins } from './useWorkspacePlugins';

// Plugins with an unknown interface type are dropped as unsupported, so the generated ones get a real one.
const generatePlugin = (plugin: Parameters<typeof generateDaoPlugin>[0]) =>
    generateDaoPlugin({
        interfaceType: PluginInterfaceType.MULTISIG,
        ...plugin,
    });

const useDaoOverridesMock = jest.fn(() => ({
    data: undefined,
    isPending: false,
}));

jest.mock('@/shared/api/cmsService', () => ({
    useDaoOverrides: () => useDaoOverridesMock(),
}));

describe('useWorkspacePlugins hook', () => {
    const useWorkspaceDaosSpy = jest.spyOn(
        useWorkspaceDaos,
        'useWorkspaceDaos',
    );

    const buildAccount = (id: string): IWorkspaceAccount => ({
        id,
        type: WorkspaceAccountType.DAO,
        network: Network.ETHEREUM_SEPOLIA,
        address: '0x123',
    });

    afterEach(() => {
        useWorkspaceDaosSpy.mockReset();
        useDaoOverridesMock.mockReturnValue({
            data: undefined,
            isPending: false,
        });
    });

    it('returns the visible plugins of the given type grouped by DAO in the order of the accounts', () => {
        const process = generatePlugin({
            address: '0xProcess',
            isProcess: true,
        });
        const body = generatePlugin({ address: '0xBody', isBody: true });
        const subPlugin = generatePlugin({
            address: '0xSub',
            isProcess: true,
            isSubPlugin: true,
        });
        const hidden = generatePlugin({
            address: '0xHidden',
            isProcess: true,
        });
        const firstDao = generateDao({
            id: 'first',
            plugins: [process, body, subPlugin],
        });
        const secondDao = generateDao({
            id: 'second',
            plugins: [process, hidden],
        });

        useWorkspaceDaosSpy.mockReturnValue({
            daos: { first: firstDao, second: secondDao },
            isPending: false,
        });
        useDaoOverridesMock.mockReturnValue({
            data: { second: { pluginsToHide: [{ address: '0xHidden' }] } },
        } as never);

        const { result } = renderHook(() =>
            useWorkspacePlugins({
                accounts: [buildAccount('second'), buildAccount('first')],
                type: PluginType.PROCESS,
            }),
        );

        expect(result.current.plugins).toEqual([
            { accountId: 'second', dao: secondDao, plugins: [process] },
            { accountId: 'first', dao: firstDao, plugins: [process] },
        ]);
    });

    it('filters the plugins by the given type', () => {
        const process = generatePlugin({
            address: '0xProcess',
            isProcess: true,
        });
        const body = generatePlugin({ address: '0xBody', isBody: true });
        const dao = generateDao({ id: 'dao', plugins: [process, body] });
        useWorkspaceDaosSpy.mockReturnValue({
            daos: { dao },
            isPending: false,
        });

        const { result } = renderHook(() =>
            useWorkspacePlugins({
                accounts: [buildAccount('dao')],
                type: PluginType.BODY,
            }),
        );

        expect(result.current.plugins).toEqual([
            { accountId: 'dao', dao, plugins: [body] },
        ]);
    });

    // Sub-plugins sit on a selected account, so the aggregated endpoints do cover them — unlike the plugins of a
    // linked account, which are dropped whatever the parameters.
    it('includes the sub-plugins when asked to', () => {
        const body = generatePlugin({ address: '0xBody', isBody: true });
        const subBody = generatePlugin({
            address: '0xSubBody',
            isBody: true,
            isSubPlugin: true,
        });
        const dao = generateDao({ id: 'dao', plugins: [body, subBody] });
        useWorkspaceDaosSpy.mockReturnValue({
            daos: { dao },
            isPending: false,
        });

        const { result } = renderHook(() =>
            useWorkspacePlugins({
                accounts: [buildAccount('dao')],
                type: PluginType.BODY,
                includeSubPlugins: true,
            }),
        );

        expect(result.current.plugins).toEqual([
            { accountId: 'dao', dao, plugins: [body, subBody] },
        ]);
    });

    it('leaves out the DAOs that are not resolved', () => {
        useWorkspaceDaosSpy.mockReturnValue({ daos: {}, isPending: true });

        const { result } = renderHook(() =>
            useWorkspacePlugins({
                accounts: [buildAccount('dao')],
                type: PluginType.PROCESS,
            }),
        );

        expect(result.current.plugins).toEqual([]);
        expect(result.current.isPending).toBe(true);
    });

    // The overrides decide which plugins are returned, so a caller that renders on the DAOs alone renders plugins
    // that are about to be filtered out — a tab for a hidden body, and its rows fetched behind it.
    it('reports the plugins as pending until the CMS overrides land', () => {
        const body = generatePlugin({ address: '0xBody', isBody: true });
        const dao = generateDao({ id: 'dao', plugins: [body] });
        useWorkspaceDaosSpy.mockReturnValue({
            daos: { dao },
            isPending: false,
        });
        useDaoOverridesMock.mockReturnValue({
            data: undefined,
            isPending: true,
        });

        const { result } = renderHook(() =>
            useWorkspacePlugins({
                accounts: [buildAccount('dao')],
                type: PluginType.BODY,
            }),
        );

        expect(result.current.isPending).toBe(true);
    });

    // The callers that only need a DAO — the rows of a list naming the DAO they belong to — must not wait for the
    // CMS, which decides nothing they read.
    it('reports the DAOs as resolved while the CMS overrides are still pending', () => {
        const body = generatePlugin({ address: '0xBody', isBody: true });
        const dao = generateDao({ id: 'dao', plugins: [body] });
        useWorkspaceDaosSpy.mockReturnValue({
            daos: { dao },
            isPending: false,
        });
        useDaoOverridesMock.mockReturnValue({
            data: undefined,
            isPending: true,
        });

        const { result } = renderHook(() =>
            useWorkspacePlugins({
                accounts: [buildAccount('dao')],
                type: PluginType.BODY,
            }),
        );

        expect(result.current.isPending).toBe(true);
        expect(result.current.isDaosPending).toBe(false);
    });
});
