import { renderHook } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceDaoPlugins } from '../useWorkspacePlugins';
import * as useWorkspacePluginsModule from '../useWorkspacePlugins';
import { useWorkspaceMemberTabs } from './useWorkspaceMemberTabs';

jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(() => new URLSearchParams()),
}));

describe('useWorkspaceMemberTabs hook', () => {
    const useSearchParamsMock = useSearchParams as jest.MockedFunction<
        typeof useSearchParams
    >;
    const useWorkspacePluginsSpy = jest.spyOn(
        useWorkspacePluginsModule,
        'useWorkspacePlugins',
    );

    const network = Network.ETHEREUM_SEPOLIA;
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const buildAccount = (
        address: string,
        type = WorkspaceAccountType.DAO,
    ): IWorkspaceAccount => ({
        id: `${network}-${address}`,
        type,
        network,
        address,
    });

    const multisig = generateDaoPlugin({
        address: '0xMultisig',
        name: 'Multisig',
        slug: 'mul',
        isBody: true,
        interfaceType: PluginInterfaceType.MULTISIG,
    });
    const tokenVoting = generateDaoPlugin({
        address: '0xTokenVoting',
        name: 'Token holders',
        slug: 'tok',
        isBody: true,
        interfaceType: PluginInterfaceType.TOKEN_VOTING,
    });

    const mockPlugins = (plugins: IWorkspaceDaoPlugins[], isPending = false) =>
        useWorkspacePluginsSpy.mockReturnValue({
            daos: {},
            isPending,
            isDaosPending: isPending,
            isPluginsPending: false,
            plugins,
        });

    const buildGroup = (
        address: string,
        plugins = [tokenVoting, multisig],
    ): IWorkspaceDaoPlugins => ({
        accountId: `${network}-${address}`,
        dao: generateDao({ address, network, name: 'Demo DAO' }),
        plugins,
    });

    const urlWithTab = (uniqueId: string) =>
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({ members: uniqueId }) as ReturnType<
                typeof useSearchParams
            >,
        );

    beforeEach(() => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams() as ReturnType<typeof useSearchParams>,
        );
        mockPlugins([buildGroup(daoAddress)]);
    });

    afterEach(() => {
        useWorkspacePluginsSpy.mockReset();
        useSearchParamsMock.mockReset();
    });

    const renderTabs = (accounts = [buildAccount(daoAddress)]) =>
        renderHook(() => useWorkspaceMemberTabs({ accounts }));

    it('builds one tab per body, tagged with the account it is installed on', () => {
        const { result } = renderTabs();

        expect(result.current.pluginTabs).toHaveLength(2);
        expect(result.current.pluginTabs[0]).toEqual(
            expect.objectContaining({
                accountId: `${network}-${daoAddress}`,
                uniqueId: `${network}-0xTokenVoting-tok`,
            }),
        );
        expect(result.current.hasTabs).toBeTruthy();
    });

    // Every tab belongs to the same DAO, so naming it on each one says nothing.
    it('labels the tabs with the body alone for a single tabbed account', () => {
        const { result } = renderTabs();

        expect(result.current.pluginTabs.map((tab) => tab.label)).toEqual([
            'Token holders',
            'Multisig',
        ]);
    });

    // A Safe contributes members without a tab, which does not make the one DAO's name worth repeating.
    it('labels the tabs with the body alone when the other account contributes none', () => {
        const { result } = renderTabs([
            buildAccount(daoAddress),
            buildAccount(safeAddress, WorkspaceAccountType.SAFE),
        ]);

        expect(result.current.pluginTabs.map((tab) => tab.label)).toEqual([
            'Token holders',
            'Multisig',
        ]);
    });

    it('labels the tabs with the DAO and the body across tabbed accounts', () => {
        const otherAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
        mockPlugins([
            buildGroup(daoAddress, [tokenVoting]),
            buildGroup(otherAddress, [multisig]),
        ]);
        const { result } = renderTabs([
            buildAccount(daoAddress),
            buildAccount(otherAddress),
        ]);

        expect(result.current.pluginTabs.map((tab) => tab.label)).toEqual([
            'app.workspace.workspaceMemberList.pluginTab (dao=Demo DAO,plugin=Token holders)',
            'app.workspace.workspaceMemberList.pluginTab (dao=Demo DAO,plugin=Multisig)',
        ]);
    });

    it('resolves the tab the url names', () => {
        urlWithTab(`${network}-0xMultisig-mul`);
        const { result } = renderTabs();

        expect(result.current.activeTab?.meta).toEqual(multisig);
    });

    // The group tab is not a body, so nothing is selected and the aside describes the aggregate instead.
    it('reports no active tab while the group tab is active', () => {
        const { result } = renderTabs();

        expect(result.current.activeTab).toBeUndefined();
    });

    // With one body and nothing else in the list, the group tab would show exactly what the body tab does, so no
    // strip is rendered and the aside describes that body — as the DAO members page does for a single body.
    it('reports the only body as active when it covers the whole list', () => {
        mockPlugins([buildGroup(daoAddress, [multisig])]);
        const { result } = renderTabs();

        expect(result.current.hasTabs).toBeFalsy();
        expect(result.current.activeTab?.meta).toEqual(multisig);
    });

    // A Safe's owners still reach the list, so the group tab shows more than the lone body tab does.
    it('reports a strip for a lone body when another account contributes members', () => {
        mockPlugins([buildGroup(daoAddress, [multisig])]);
        urlWithTab(`${network}-0xMultisig-mul`);
        const { result } = renderTabs([
            buildAccount(daoAddress),
            buildAccount(safeAddress, WorkspaceAccountType.SAFE),
        ]);

        expect(result.current.hasTabs).toBeTruthy();
        expect(result.current.activeTab?.meta).toEqual(multisig);
    });

    it('reports no active tab while the plugins are still being read', () => {
        mockPlugins([buildGroup(daoAddress)], true);
        urlWithTab(`${network}-0xMultisig-mul`);
        const { result } = renderTabs();

        expect(result.current.hasTabs).toBeFalsy();
        expect(result.current.activeTab).toBeUndefined();
    });

    it('builds no tab for an empty account list', () => {
        mockPlugins([]);
        const { result } = renderTabs([]);

        expect(result.current.pluginTabs).toEqual([]);
        expect(result.current.hasTabs).toBeFalsy();
        expect(result.current.activeTab).toBeUndefined();
    });

    // The parameter is validated against the tabs, not trusted: the list falls back to the group tab for an
    // unknown one without rewriting the URL, so the aside has to read it the same way.
    it('reports no active tab for a parameter naming no tab', () => {
        urlWithTab('ethereum-0xNotInstalled-nope');
        const { result } = renderTabs();

        expect(result.current.hasTabs).toBeTruthy();
        expect(result.current.activeTab).toBeUndefined();
    });

    // The rows need them alongside the tabs, so they come back out of the same read.
    it('returns the bodies the rows are built from', () => {
        const { result } = renderTabs();

        expect(result.current.bodyPlugins).toEqual([buildGroup(daoAddress)]);
    });
});
