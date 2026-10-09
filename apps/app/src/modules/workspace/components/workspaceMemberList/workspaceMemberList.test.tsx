import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
    daoService,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import {
    generateDao,
    generateDaoPlugin,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import {
    type IWorkspaceMember,
    type IWorkspaceQueryResponse,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { generateWorkspaceQueryResponse } from '../../testUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    type IWorkspaceMemberListProps,
    WorkspaceMemberList,
} from './workspaceMemberList';

const useDaoOverridesMock = jest.fn(() => ({
    data: undefined,
    isPending: false,
}));

jest.mock('@/shared/api/cmsService', () => ({
    useDaoOverrides: () => useDaoOverridesMock(),
}));

// Lists the tabs and renders the content of the last one, so the request of a body tab can be asserted.
jest.mock('@/shared/components/pluginFilterComponent', () => ({
    PluginFilterComponent: (props: {
        plugins: IFilterComponentPlugin[];
        renderContent: (plugin: IFilterComponentPlugin) => ReactNode;
    }) => (
        <div data-testid="plugin-filter-mock">
            {props.plugins.map((plugin) => (
                <span data-testid="plugin-tab" key={plugin.uniqueId}>
                    {plugin.label}
                </span>
            ))}
            {props.renderContent(
                props.plugins.at(-1) as IFilterComponentPlugin,
            )}
        </div>
    ),
}));

describe('<WorkspaceMemberList /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c';
    const network = Network.ETHEREUM_SEPOLIA;

    // React Query dedupes by key, so each test gets its own address: a result cached by an earlier test would
    // otherwise satisfy a later render and its own mock would never be called.
    let testIndex = 0;
    const nextAddress = () => {
        testIndex += 1;
        return daoAddress.replace(
            /.{2}$/,
            testIndex.toString().padStart(2, '0'),
        );
    };

    const getMemberListSpy = jest.spyOn(workspaceQueryService, 'getMemberList');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');

    const buildAccount = (
        address: string,
        type = WorkspaceAccountType.DAO,
    ): IWorkspaceAccount => ({
        id: workspaceUtils.buildAccountId({ network, address }),
        type,
        network,
        address,
    });

    beforeEach(() => {
        getMemberListSpy.mockResolvedValue(
            generateWorkspaceQueryResponse<IWorkspaceMember>({
                data: [],
            }) as IWorkspaceQueryResponse<IWorkspaceMember>,
        );
        getDaoSpy.mockResolvedValue(generateDao());
    });

    afterEach(() => {
        getMemberListSpy.mockReset();
        getDaoSpy.mockReset();
        useDaoOverridesMock.mockReturnValue({
            data: undefined,
            isPending: false,
        });
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceMemberListProps>,
    ) => {
        const completeProps: IWorkspaceMemberListProps = {
            workspaceId: 'demo',
            accounts: [buildAccount(nextAddress())],
            pageSize: 18,
            ...props,
        };

        // The client must reach `GukModulesProvider`: it nests its own `QueryClientProvider` and otherwise falls
        // back to a module-level default client, which both ignores these options and leaks its cache between
        // tests.
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });

        return (
            <ReactQueryWrapper client={client}>
                <GukModulesProvider queryClient={client}>
                    <WorkspaceMemberList {...completeProps} />
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    it('reads the members of the given accounts', async () => {
        const address = nextAddress();
        render(createTestComponent({ accounts: [buildAccount(address)] }));

        await waitFor(() =>
            expect(getMemberListSpy).toHaveBeenCalledWith({
                body: {
                    accounts: [{ network, address }],
                    pagination: { pageSize: 18 },
                },
            }),
        );
    });

    it('renders no tabs when the DAOs have a single body', async () => {
        const address = nextAddress();
        getDaoSpy.mockResolvedValue(
            generateDao({
                address,
                network,
                plugins: [
                    generateDaoPlugin({
                        isBody: true,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                ],
            }),
        );

        render(createTestComponent({ accounts: [buildAccount(address)] }));

        await waitFor(() => expect(getMemberListSpy).toHaveBeenCalled());
        expect(
            screen.queryByTestId('plugin-filter-mock'),
        ).not.toBeInTheDocument();
    });

    // Every tab belongs to the same DAO, so repeating its name on each one says nothing — the rule the proposals
    // tabs follow.
    it('labels the tabs with the body alone when a single account contributes them', async () => {
        const address = nextAddress();
        getDaoSpy.mockResolvedValue(
            generateDao({
                address,
                network,
                name: 'Only DAO',
                plugins: [
                    generateDaoPlugin({
                        address: '0xMultisig',
                        name: 'Multisig',
                        isBody: true,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                    generateDaoPlugin({
                        address: '0xTokenVoting',
                        name: 'Token holders',
                        isBody: true,
                        interfaceType: PluginInterfaceType.TOKEN_VOTING,
                    }),
                ],
            }),
        );

        render(createTestComponent({ accounts: [buildAccount(address)] }));

        const tabs = await screen.findAllByTestId('plugin-tab');

        expect(tabs.map((tab) => tab.textContent)).toEqual([
            'app.workspace.workspaceMemberList.groupTab',
            'Token holders',
            'Multisig',
        ]);
    });

    // A Safe contributes members but has no body to put in a tab, so the group tab shows more than the single body
    // tab does and the tabs earn their place.
    it('renders the tabs for a single body when the workspace also holds a Safe account', async () => {
        const address = nextAddress();
        getDaoSpy.mockResolvedValue(
            generateDao({
                address,
                network,
                name: 'Only DAO',
                plugins: [
                    generateDaoPlugin({
                        address: '0xBody',
                        name: 'Body',
                        isBody: true,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                ],
            }),
        );

        render(
            createTestComponent({
                accounts: [
                    buildAccount(address),
                    buildAccount(safeAddress, WorkspaceAccountType.SAFE),
                ],
            }),
        );

        const tabs = await screen.findAllByTestId('plugin-tab');
        // One DAO contributes every tab, so the tab names the body alone.
        expect(tabs.map((tab) => tab.textContent)).toEqual([
            'app.workspace.workspaceMemberList.groupTab',
            'Body',
        ]);
    });

    // Its owners still reach the list, so the group tab shows more than the only tab does.
    it('renders the tabs for a single body when another account contributes no tab', async () => {
        const readableAddress = nextAddress();
        const failingAddress = nextAddress();
        const readableAccount = buildAccount(readableAddress);

        getDaoSpy.mockImplementation((params) =>
            params.urlParams.id === readableAccount.id
                ? Promise.resolve(
                      generateDao({
                          id: readableAccount.id,
                          address: readableAddress,
                          network,
                          name: 'Only DAO',
                          plugins: [
                              generateDaoPlugin({
                                  address: '0xBody',
                                  name: 'Body',
                                  isBody: true,
                                  interfaceType: PluginInterfaceType.MULTISIG,
                              }),
                          ],
                      }),
                  )
                : Promise.reject(new Error('dao not found')),
        );

        render(
            createTestComponent({
                accounts: [readableAccount, buildAccount(failingAddress)],
            }),
        );

        const tabs = await screen.findAllByTestId('plugin-tab');
        // One DAO contributes every tab, so the tab names the body alone.
        expect(tabs.map((tab) => tab.textContent)).toEqual([
            'app.workspace.workspaceMemberList.groupTab',
            'Body',
        ]);
    });

    it('renders a group tab followed by the visible bodies of every DAO', async () => {
        const firstAddress = nextAddress();
        const secondAddress = nextAddress();
        const firstAccount = buildAccount(firstAddress);
        const secondAccount = buildAccount(secondAddress);

        const multisig = generateDaoPlugin({
            address: '0xMultisig',
            name: 'Multisig',
            interfaceType: PluginInterfaceType.MULTISIG,
            isBody: true,
        });
        const tokenVoting = generateDaoPlugin({
            address: '0xTokenVoting',
            name: 'Token voting',
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            isBody: true,
        });
        const process = generateDaoPlugin({
            address: '0xProcess',
            isProcess: true,
        });
        const hidden = generateDaoPlugin({
            address: '0xHidden',
            name: 'Hidden',
            isBody: true,
        });
        const linked = generateDaoPlugin({
            address: '0xLinked',
            name: 'Linked',
            isBody: true,
            daoAddress: '0xLinkedAccount',
        });

        getDaoSpy.mockImplementation((params) =>
            Promise.resolve(
                params.urlParams.id === firstAccount.id
                    ? generateDao({
                          id: firstAccount.id,
                          address: firstAddress,
                          network,
                          name: 'First',
                          plugins: [multisig, tokenVoting, process],
                      })
                    : generateDao({
                          id: secondAccount.id,
                          address: secondAddress,
                          network,
                          name: 'Second',
                          plugins: [tokenVoting, hidden, linked],
                          linkedAccounts: [
                              generateDao({ address: '0xLinkedAccount' }),
                          ],
                      }),
            ),
        );
        useDaoOverridesMock.mockReturnValue({
            data: {
                [secondAccount.id]: {
                    pluginsToHide: [{ address: '0xHidden' }],
                },
            },
            isPending: false,
        } as never);

        render(
            createTestComponent({ accounts: [firstAccount, secondAccount] }),
        );

        const pluginTab = 'app.workspace.workspaceMemberList.pluginTab';
        const tabs = await screen.findAllByTestId('plugin-tab');
        expect(tabs.map((tab) => tab.textContent)).toEqual([
            'app.workspace.workspaceMemberList.groupTab',
            `${pluginTab} (dao=First,plugin=Token voting)`,
            `${pluginTab} (dao=First,plugin=Multisig)`,
            `${pluginTab} (dao=Second,plugin=Token voting)`,
        ]);

        // The member endpoint narrows by governance address, not by plugin address as the proposal one does.
        await waitFor(() =>
            expect(getMemberListSpy).toHaveBeenCalledWith({
                body: {
                    accounts: [
                        { network, address: firstAddress },
                        { network, address: secondAddress },
                    ],
                    filters: { network, governanceAddress: '0xTokenVoting' },
                    pagination: { pageSize: 18 },
                },
            }),
        );
    });

    // `DaoMemberListContainer` lists them too: a body nested in a process holds members of its own, and it sits on
    // a selected account, so the endpoint returns them.
    it('includes the bodies nested inside a process', async () => {
        const address = nextAddress();
        getDaoSpy.mockResolvedValue(
            generateDao({
                address,
                network,
                name: 'DAO',
                plugins: [
                    generateDaoPlugin({
                        address: '0xBody',
                        name: 'Body',
                        isBody: true,
                        interfaceType: PluginInterfaceType.TOKEN_VOTING,
                    }),
                    generateDaoPlugin({
                        address: '0xSubBody',
                        name: 'Sub body',
                        isBody: true,
                        isSubPlugin: true,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                ],
            }),
        );

        render(createTestComponent({ accounts: [buildAccount(address)] }));

        const tabs = await screen.findAllByTestId('plugin-tab');
        expect(tabs.map((tab) => tab.textContent)).toEqual([
            'app.workspace.workspaceMemberList.groupTab',
            'Body',
            'Sub body',
        ]);
    });

    // The overrides decide which bodies are visible, and the tabs are validated against the URL parameter at mount
    // only: a tab offered before they land is a tab for a body the CMS may hide, selectable and fetched behind it.
    it('renders no tabs until the CMS overrides land', async () => {
        const address = nextAddress();
        getDaoSpy.mockResolvedValue(
            generateDao({
                address,
                network,
                plugins: [
                    generateDaoPlugin({
                        address: '0xMultisig',
                        isBody: true,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                    generateDaoPlugin({
                        address: '0xTokenVoting',
                        isBody: true,
                        interfaceType: PluginInterfaceType.TOKEN_VOTING,
                    }),
                ],
            }),
        );
        useDaoOverridesMock.mockReturnValue({
            data: undefined,
            isPending: true,
        });

        render(createTestComponent({ accounts: [buildAccount(address)] }));

        await waitFor(() => expect(getMemberListSpy).toHaveBeenCalled());
        expect(
            screen.queryByTestId('plugin-filter-mock'),
        ).not.toBeInTheDocument();
    });
});
