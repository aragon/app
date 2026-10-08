import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { generateProposal } from '@/modules/governance/testUtils';
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
    type IWorkspaceProposal,
    type IWorkspaceProposalListResponse,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    type IWorkspaceProposalListProps,
    WorkspaceProposalList,
} from './workspaceProposalList';

const useDaoOverridesMock = jest.fn(() => ({
    data: undefined,
    isPending: false,
}));

jest.mock('@/shared/api/cmsService', () => ({
    useDaoOverrides: () => useDaoOverridesMock(),
}));

// Lists the tabs and renders the content of the last one, so the request of a plugin tab can be asserted.
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

describe('<WorkspaceProposalList /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
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

    const getProposalListSpy = jest.spyOn(
        workspaceQueryService,
        'getProposalList',
    );
    const getDaoSpy = jest.spyOn(daoService, 'getDao');

    const buildAccount = (address: string): IWorkspaceAccount => ({
        id: workspaceUtils.buildAccountId({ network, address }),
        type: WorkspaceAccountType.DAO,
        network,
        address,
    });

    const buildProposal = (
        address: string,
        proposal?: Partial<IWorkspaceProposal>,
    ): IWorkspaceProposal => ({
        ...generateProposal({
            id: `proposal-${address}`,
            network,
            daoAddress: address,
            pluginAddress: '0xPlugin',
            incrementalId: 4,
        }),
        ...proposal,
    });

    const buildResponse = (
        response?: Partial<IWorkspaceProposalListResponse>,
    ): IWorkspaceProposalListResponse => ({
        data: [],
        metadata: { page: 1, pageSize: 10, totalPages: 1, totalRecords: 0 },
        ...response,
    });

    beforeEach(() => {
        getProposalListSpy.mockResolvedValue(buildResponse());
        getDaoSpy.mockResolvedValue(generateDao());
    });

    afterEach(() => {
        getProposalListSpy.mockReset();
        getDaoSpy.mockReset();
        useDaoOverridesMock.mockReturnValue({
            data: undefined,
            isPending: false,
        });
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceProposalListProps>,
    ) => {
        const completeProps: IWorkspaceProposalListProps = {
            accounts: [buildAccount(nextAddress())],
            pageSize: 10,
            ...props,
        };

        // The client must reach `GukModulesProvider`: it nests its own `QueryClientProvider` and otherwise falls
        // back to a module-level default client, which both ignores these options and leaks its cache between
        // tests. Retries are off so a rejected DAO read settles as an error instead of leaving the list loading
        // forever, which would make the "missing DAO" assertion below pass for the wrong reason.
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });

        return (
            <ReactQueryWrapper client={client}>
                <GukModulesProvider queryClient={client}>
                    <WorkspaceProposalList {...completeProps} />
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    it('reads the proposals of the given accounts', async () => {
        const address = nextAddress();
        render(createTestComponent({ accounts: [buildAccount(address)] }));

        await waitFor(() =>
            expect(getProposalListSpy).toHaveBeenCalledWith({
                body: {
                    accounts: [{ network, address }],
                    pagination: { pageSize: 10 },
                },
            }),
        );
    });

    it('tags each row with the name of the DAO the proposal belongs to', async () => {
        const address = nextAddress();
        getProposalListSpy.mockResolvedValue(
            buildResponse({
                data: [buildProposal(address)],
                metadata: {
                    page: 1,
                    pageSize: 10,
                    totalPages: 1,
                    totalRecords: 1,
                },
            }),
        );
        getDaoSpy.mockResolvedValue(
            generateDao({
                address,
                network,
                name: 'Embedded DAO name',
                plugins: [generateDaoPlugin({ address: '0xPlugin' })],
            }),
        );

        render(createTestComponent({ accounts: [buildAccount(address)] }));

        expect(
            await screen.findByText('Embedded DAO name'),
        ).toBeInTheDocument();
    });

    it('drops a row whose DAO could not be read but keeps the rows that resolved', async () => {
        const readableAddress = nextAddress();
        const failingAddress = nextAddress();
        const readableAccount = buildAccount(readableAddress);

        getProposalListSpy.mockResolvedValue(
            buildResponse({
                data: [
                    buildProposal(readableAddress, {
                        title: 'Readable DAO proposal',
                    }),
                    buildProposal(failingAddress, {
                        title: 'Failing DAO proposal',
                    }),
                ],
                metadata: {
                    page: 1,
                    pageSize: 10,
                    totalPages: 1,
                    totalRecords: 2,
                },
            }),
        );
        getDaoSpy.mockImplementation((params) =>
            params.urlParams.id === readableAccount.id
                ? Promise.resolve(
                      generateDao({
                          address: readableAddress,
                          network,
                          plugins: [generateDaoPlugin({ address: '0xPlugin' })],
                      }),
                  )
                : Promise.reject(new Error('dao not found')),
        );

        render(
            createTestComponent({
                accounts: [readableAccount, buildAccount(failingAddress)],
            }),
        );

        // The surviving row is the positive signal that the list rendered at all, so the absence below is not
        // asserted against a still-loading tree.
        expect(
            await screen.findByText('Readable DAO proposal'),
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Failing DAO proposal'),
        ).not.toBeInTheDocument();
    });

    it('does not request the proposals when the workspace has no DAO account', () => {
        render(createTestComponent({ accounts: [] }));

        expect(getProposalListSpy).not.toHaveBeenCalled();
    });

    it('renders no tabs when the DAOs have a single process plugin', async () => {
        const address = nextAddress();
        getDaoSpy.mockResolvedValue(
            generateDao({
                address,
                network,
                plugins: [generateDaoPlugin({ isProcess: true })],
            }),
        );

        render(createTestComponent({ accounts: [buildAccount(address)] }));

        await waitFor(() => expect(getProposalListSpy).toHaveBeenCalled());
        expect(
            screen.queryByTestId('plugin-filter-mock'),
        ).not.toBeInTheDocument();
    });

    it('renders a group tab followed by the visible process plugins of every DAO', async () => {
        const firstAddress = nextAddress();
        const secondAddress = nextAddress();
        const firstAccount = buildAccount(firstAddress);
        const secondAccount = buildAccount(secondAddress);

        const multisig = generateDaoPlugin({
            address: '0xMultisig',
            name: 'Multisig',
            interfaceType: PluginInterfaceType.MULTISIG,
            isProcess: true,
        });
        const tokenVoting = generateDaoPlugin({
            address: '0xTokenVoting',
            name: 'Token voting',
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            isProcess: true,
        });
        const body = generateDaoPlugin({ address: '0xBody', isBody: true });
        const subPlugin = generateDaoPlugin({
            address: '0xSub',
            isProcess: true,
            isSubPlugin: true,
        });
        const hidden = generateDaoPlugin({
            address: '0xHidden',
            name: 'Hidden',
            isProcess: true,
        });
        const linked = generateDaoPlugin({
            address: '0xLinked',
            name: 'Linked',
            isProcess: true,
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
                          plugins: [multisig, tokenVoting, body, subPlugin],
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

        const pluginTab = 'app.workspace.workspaceProposalList.pluginTab';
        const tabs = await screen.findAllByTestId('plugin-tab');
        expect(tabs.map((tab) => tab.textContent)).toEqual([
            'app.workspace.workspaceProposalList.groupTab',
            `${pluginTab} (dao=First,plugin=Token voting)`,
            `${pluginTab} (dao=First,plugin=Multisig)`,
            `${pluginTab} (dao=Second,plugin=Token voting)`,
        ]);

        await waitFor(() =>
            expect(getProposalListSpy).toHaveBeenCalledWith({
                body: {
                    accounts: [
                        { network, address: firstAddress },
                        { network, address: secondAddress },
                    ],
                    filters: { network, pluginAddress: '0xTokenVoting' },
                    pagination: { pageSize: 10 },
                },
            }),
        );
    });

    // The overrides decide which processes are visible, and the tabs are validated against the URL parameter at
    // mount only: a tab offered before they land is a tab for a process the CMS may hide, selectable and fetched
    // behind it.
    it('renders no tabs until the CMS overrides land', async () => {
        const address = nextAddress();
        getDaoSpy.mockResolvedValue(
            generateDao({
                address,
                network,
                plugins: [
                    generateDaoPlugin({
                        address: '0xMultisig',
                        isProcess: true,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                    generateDaoPlugin({
                        address: '0xTokenVoting',
                        isProcess: true,
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

        await waitFor(() => expect(getProposalListSpy).toHaveBeenCalled());
        expect(
            screen.queryByTestId('plugin-filter-mock'),
        ).not.toBeInTheDocument();
    });
});
