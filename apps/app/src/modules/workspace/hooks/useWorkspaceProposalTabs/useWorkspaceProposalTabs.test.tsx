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
import { useWorkspaceProposalTabs } from './useWorkspaceProposalTabs';

jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(() => new URLSearchParams()),
}));

describe('useWorkspaceProposalTabs hook', () => {
    const useSearchParamsMock = useSearchParams as jest.MockedFunction<
        typeof useSearchParams
    >;
    const useWorkspacePluginsSpy = jest.spyOn(
        useWorkspacePluginsModule,
        'useWorkspacePlugins',
    );

    const network = Network.ETHEREUM_SEPOLIA;
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const buildAccount = (address: string): IWorkspaceAccount => ({
        id: `${network}-${address}`,
        type: WorkspaceAccountType.DAO,
        network,
        address,
    });

    const multisig = generateDaoPlugin({
        address: '0xMultisig',
        name: 'Multisig',
        slug: 'mul',
        interfaceType: PluginInterfaceType.MULTISIG,
    });
    const tokenVoting = generateDaoPlugin({
        address: '0xTokenVoting',
        name: 'Token voting',
        slug: 'tok',
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

    const urlWithTab = (uniqueId: string) =>
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({ proposals: uniqueId }) as ReturnType<
                typeof useSearchParams
            >,
        );

    const buildGroup = (
        address: string,
        plugins = [tokenVoting, multisig],
    ): IWorkspaceDaoPlugins => ({
        accountId: `${network}-${address}`,
        dao: generateDao({ address, network, name: 'Demo DAO' }),
        plugins,
    });

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
        renderHook(() => useWorkspaceProposalTabs({ accounts }));

    it('builds one tab per process, tagged with the account it is installed on', () => {
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

    // Under an account scope every tab belongs to the same DAO, so naming it on each one says nothing.
    it('labels the tabs with the process alone for a single account', () => {
        const { result } = renderTabs();

        expect(result.current.pluginTabs.map((tab) => tab.label)).toEqual([
            'Token voting',
            'Multisig',
        ]);
    });

    it('labels the tabs with the DAO and the process across accounts', () => {
        const otherAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
        mockPlugins([
            buildGroup(daoAddress, [tokenVoting]),
            buildGroup(otherAddress, [multisig]),
        ]);
        const { result } = renderTabs([
            buildAccount(daoAddress),
            buildAccount(otherAddress),
        ]);

        expect(result.current.pluginTabs.map((tab) => tab.label)).toEqual([
            'app.workspace.workspaceProposalList.pluginTab (dao=Demo DAO,plugin=Token voting)',
            'app.workspace.workspaceProposalList.pluginTab (dao=Demo DAO,plugin=Multisig)',
        ]);
    });

    it('resolves the tab the url names', () => {
        urlWithTab(`${network}-0xMultisig-mul`);
        const { result } = renderTabs();

        expect(result.current.activeTab?.meta).toEqual(multisig);
    });

    // The group tab is not a process, so nothing is selected and the aside describes the selection instead.
    it('reports no active tab while the group tab is active', () => {
        const { result } = renderTabs();

        expect(result.current.activeTab).toBeUndefined();
    });

    // No strip to choose from, so the unfiltered list shows only that one process and the aside describes it —
    // what the DAO proposals page does for a DAO with a single process, its group tab being dropped below two.
    it('reports the only process as active when there is no strip to choose from', () => {
        mockPlugins([buildGroup(daoAddress, [multisig])]);
        const { result } = renderTabs();

        expect(result.current.hasTabs).toBeFalsy();
        expect(result.current.activeTab?.meta).toEqual(multisig);
    });

    // Nothing is selected, so the parameter the URL happens to carry changes nothing.
    it('reports the only process as active whatever the url names', () => {
        mockPlugins([buildGroup(daoAddress, [multisig])]);
        urlWithTab('ethereum-0xNotInstalled-nope');
        const { result } = renderTabs();

        expect(result.current.activeTab?.meta).toEqual(multisig);
    });

    // The list aggregates both accounts unfiltered, so the one visible process describes only part of it: there is
    // nothing for a process card to be right about, and the aggregated card stands.
    it('reports no active tab for a lone process across several accounts', () => {
        const otherAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
        mockPlugins([
            buildGroup(daoAddress, [multisig]),
            buildGroup(otherAddress, []),
        ]);
        const { result } = renderTabs([
            buildAccount(daoAddress),
            buildAccount(otherAddress),
        ]);

        expect(result.current.pluginTabs).toHaveLength(1);
        expect(result.current.hasTabs).toBeFalsy();
        expect(result.current.activeTab).toBeUndefined();
    });

    it('reports no active tab while the DAOs are still being read', () => {
        mockPlugins([buildGroup(daoAddress)], true);
        urlWithTab(`${network}-0xMultisig-mul`);
        const { result } = renderTabs();

        expect(result.current.hasTabs).toBeFalsy();
        expect(result.current.activeTab).toBeUndefined();
    });

    // A workspace with no DAO account, or a route scoped to a Safe that resolved to nothing.
    it('builds no tab for an empty account list', () => {
        mockPlugins([]);
        const { result } = renderTabs([]);

        expect(result.current.pluginTabs).toEqual([]);
        expect(result.current.hasTabs).toBeFalsy();
        expect(result.current.activeTab).toBeUndefined();
    });

    // Every process of the account is hidden through the CMS, so the strip would have nothing to offer.
    it('builds no tab for an account whose processes are all hidden', () => {
        mockPlugins([buildGroup(daoAddress, [])]);
        const { result } = renderTabs();

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

    // The rows need a DAO, the strip needs the visibility overrides too, so the two waits are reported apart.
    it('reports the DAO read apart from the overrides', () => {
        useWorkspacePluginsSpy.mockReturnValue({
            daos: {},
            isPending: true,
            isDaosPending: false,
            isPluginsPending: true,
            plugins: [buildGroup(daoAddress)],
        });
        const { result } = renderTabs();

        expect(result.current.isPending).toBeTruthy();
        expect(result.current.isDaosPending).toBeFalsy();
        expect(result.current.hasTabs).toBeFalsy();
    });
});
