import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import * as ensModule from '@/modules/ens';
import { type IDaoPlugin, Network } from '@/shared/api/daoService';
import * as useDaoChainHook from '@/shared/hooks/useDaoChain';
import {
    generateDaoPlugin,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import * as workspaceQueryService from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    generateWorkspaceMember,
    generateWorkspaceMembership,
    generateWorkspaceQueryResponse,
} from '../../testUtils';
import {
    type IWorkspaceAccountPlugins,
    type IWorkspaceMemberListDefaultProps,
    WorkspaceMemberListDefault,
} from './workspaceMemberListDefault';

describe('<WorkspaceMemberListDefault /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c';
    const memberAddress = '0x1234567890123456789012345678901234567890';

    // Default governance of `generateWorkspaceMembership`, i.e. the body the links below are expected to name.
    const governanceAddress = '0x0000000000000000000000000000000000000001';
    // A membership-only body: no process of its own, so the rows below name only the body.
    const body = generateDaoPlugin({
        address: governanceAddress,
        isBody: true,
    });
    const bodyId = daoUtils.buildPluginUniqueId(body);

    /**
     * The plugin map the list is handed in production, where the bodies of an account are known.
     */
    const buildPlugins = (
        bodies: IDaoPlugin[],
        processes: IDaoPlugin[] = [],
    ): Record<string, IWorkspaceAccountPlugins> => ({
        [daoAccount.id]: { bodies, processes },
    });

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const useWorkspaceMemberListSpy = jest.spyOn(
        workspaceQueryService,
        'useWorkspaceMemberList',
    );
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useEnsAvatarSpy = jest.spyOn(ensModule, 'useEnsAvatar');
    const useDaoChainSpy = jest.spyOn(useDaoChainHook, 'useDaoChain');
    const buildEntityUrlMock = jest.fn(
        ({ type, id }: { type: string; id?: string }) =>
            `https://explorer.test/${type}/${id}`,
    );

    const mockMembers = (
        members: workspaceQueryService.IWorkspaceMember[],
        options?: { partial?: boolean },
    ) =>
        useWorkspaceMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: {
                    pages: [
                        generateWorkspaceQueryResponse({
                            data: members,
                            partial: options?.partial ?? false,
                            metadata: generatePaginatedResponseMetadata({
                                page: 1,
                                totalPages: 1,
                                totalRecords: members.length,
                            }),
                        }),
                    ],
                    pageParams: [],
                },
            }) as unknown as ReturnType<
                typeof workspaceQueryService.useWorkspaceMemberList
            >,
        );

    beforeEach(() => {
        mockMembers([]);
        useEnsNameSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        useEnsAvatarSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsAvatar>);
        useDaoChainSpy.mockReturnValue({
            buildEntityUrl: buildEntityUrlMock,
        } as unknown as ReturnType<typeof useDaoChainHook.useDaoChain>);
    });

    afterEach(() => {
        useWorkspaceMemberListSpy.mockReset();
        useEnsNameSpy.mockReset();
        useEnsAvatarSpy.mockReset();
        useDaoChainSpy.mockReset();
        buildEntityUrlMock.mockClear();
    });

    // The query client must sit inside the gov-ui-kit provider, which carries a query client of its own that would
    // otherwise shadow this one.
    const createTestComponent = (
        props?: Partial<IWorkspaceMemberListDefaultProps>,
    ) => {
        const completeProps: IWorkspaceMemberListDefaultProps = {
            workspaceId: 'demo',
            accounts: [daoAccount, safeAccount],
            pageSize: 18,
            visiblePluginsByAccountId: buildPlugins([body]),
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient()}>
                    <WorkspaceMemberListDefault {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('requests the members of every account, DAOs and Safes alike', () => {
        render(createTestComponent());

        expect(useWorkspaceMemberListSpy).toHaveBeenCalledWith(
            {
                body: {
                    accounts: [
                        {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: daoAddress,
                        },
                        {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: safeAddress,
                        },
                    ],
                    pagination: { pageSize: 18 },
                },
            },
            { enabled: true },
        );
    });

    // The body travels with the link: membership is body-scoped, and the member page would otherwise pick a body of
    // its own, which for a member of two bodies need not be the one the row stood for.
    it('links a member to its member page under its first DAO account, naming the body of that membership', () => {
        mockMembers([
            generateWorkspaceMember({
                network: Network.ETHEREUM_SEPOLIA,
                address: memberAddress,
                memberships: [
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: daoAddress,
                        },
                    }),
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: safeAddress,
                        },
                        governance: { address: safeAddress, type: 'safe' },
                    }),
                ],
            }),
        ]);
        render(createTestComponent());

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'href',
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}?vote=${bodyId}`,
        );
    });

    // Only a DAO account serves a member page, so a Safe membership is skipped even when the endpoint lists it first.
    it('skips the non-DAO memberships when picking the account to link to', () => {
        mockMembers([
            generateWorkspaceMember({
                address: memberAddress,
                memberships: [
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: safeAddress,
                        },
                        governance: { address: safeAddress, type: 'safe' },
                    }),
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: daoAddress,
                        },
                    }),
                ],
            }),
        ]);
        render(createTestComponent());

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'href',
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}?vote=${bodyId}`,
        );
    });

    // A Safe owner that is a member of no DAO has no member page to open inside the workspace, and linking to its
    // Safe would render the account gate's error state.
    it('links a member of no DAO account to the address on the block explorer', () => {
        mockMembers([
            generateWorkspaceMember({
                network: Network.ETHEREUM_SEPOLIA,
                address: memberAddress,
                memberships: [
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: safeAddress,
                        },
                        governance: { address: safeAddress, type: 'safe' },
                    }),
                ],
            }),
        ]);
        render(createTestComponent());

        expect(useDaoChainSpy).toHaveBeenCalledWith({
            network: Network.ETHEREUM_SEPOLIA,
        });
        expect(buildEntityUrlMock).toHaveBeenCalledWith({
            type: 'address',
            id: memberAddress,
        });

        const link = screen.getAllByRole('link')[0];
        expect(link).toHaveAttribute(
            'href',
            `https://explorer.test/address/${memberAddress}`,
        );
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    // The DAO member page redirects any non-checksummed address to the `/dao/…` route, which would leave the
    // workspace.
    it('links to the checksummed address of the member', () => {
        const checksummed = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
        mockMembers([
            generateWorkspaceMember({
                address: checksummed.toLowerCase(),
                memberships: [
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: daoAddress,
                        },
                    }),
                ],
            }),
        ]);
        render(createTestComponent());

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'href',
            `/workspace/demo/${daoAccount.id}/members/${checksummed}?vote=${bodyId}`,
        );
    });

    // The row must name the body its tab names, which is what stops a member of a token and a multisig body,
    // clicked on the token tab, from being reported under the multisig one.
    it('names the body the list is filtered by in the member link', () => {
        const tokenBody = generateDaoPlugin({
            address: '0x00000000000000000000000000000000000000Af',
            slug: 'token',
        });
        mockMembers([
            generateWorkspaceMember({
                address: memberAddress,
                memberships: [
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: daoAddress,
                        },
                    }),
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: daoAddress,
                        },
                        governance: {
                            address: tokenBody.address,
                            type: 'tokenVoting',
                        },
                    }),
                ],
            }),
        ]);
        render(
            createTestComponent({
                filters: {
                    network: Network.ETHEREUM_SEPOLIA,
                    governanceAddress: tokenBody.address,
                },
                visiblePluginsByAccountId: buildPlugins([body, tokenBody]),
            }),
        );

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'href',
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}?vote=${daoUtils.buildPluginUniqueId(tokenBody)}`,
        );
    });

    /**
     * Renders a member holding one membership on the DAO account and returns the row's href.
     */
    const renderMemberOfBody = (
        bodyAddress: string,
        plugins: Record<string, IWorkspaceAccountPlugins>,
    ) => {
        mockMembers([
            generateWorkspaceMember({
                network: Network.ETHEREUM_SEPOLIA,
                address: memberAddress,
                memberships: [
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: daoAddress,
                        },
                        governance: { address: bodyAddress, type: 'multisig' },
                    }),
                ],
            }),
        ]);
        render(createTestComponent({ visiblePluginsByAccountId: plugins }));

        return screen.getAllByRole('link')[0];
    };

    // The proposals of the member page are filtered by process, so the row names the process the body acts through
    // as well: a DAO whose single plugin is both the body and the process names the very same governance twice.
    it('names the body as the process when the body is one', () => {
        const basicBody = generateDaoPlugin({
            address: '0x00000000000000000000000000000000000000B0',
            slug: 'multisig',
            isBody: true,
            isProcess: true,
        });
        const id = daoUtils.buildPluginUniqueId(basicBody);

        expect(
            renderMemberOfBody(
                basicBody.address,
                buildPlugins([basicBody], [basicBody]),
            ),
        ).toHaveAttribute(
            'href',
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}?vote=${id}&proposals=${id}`,
        );
    });

    // A body nested in a process — a stage body of an SPP process — votes in its own right but creates proposals
    // through its parent, which is the process the member page must open its proposals on.
    it('names the parent process of a body nested in one', () => {
        const process = generateDaoPlugin({
            address: '0x00000000000000000000000000000000000000C0',
            slug: 'spp',
            isProcess: true,
        });
        const stageBody = generateDaoPlugin({
            address: '0x00000000000000000000000000000000000000C1',
            slug: 'stage-multisig',
            isBody: true,
            isSubPlugin: true,
            parentPlugin: process.address,
        });

        expect(
            renderMemberOfBody(
                stageBody.address,
                buildPlugins([stageBody], [process]),
            ),
        ).toHaveAttribute(
            'href',
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}?vote=${daoUtils.buildPluginUniqueId(stageBody)}&proposals=${daoUtils.buildPluginUniqueId(process)}`,
        );
    });

    // The same nesting, expressed on the parent instead of the child — the backend does not guarantee which end of
    // the link it fills, and the row must name the process either way.
    it('names the process that lists the body among its sub-plugins', () => {
        const process = generateDaoPlugin({
            address: '0x00000000000000000000000000000000000000D0',
            slug: 'spp',
            isProcess: true,
            subPlugins: [
                {
                    addresses: ['0x00000000000000000000000000000000000000D1'],
                    stageIndex: 0,
                },
            ],
        });
        const stageBody = generateDaoPlugin({
            address: '0x00000000000000000000000000000000000000D1',
            slug: 'stage-multisig',
            isBody: true,
            isSubPlugin: true,
        });

        expect(
            renderMemberOfBody(
                stageBody.address,
                buildPlugins([stageBody], [process]),
            ),
        ).toHaveAttribute(
            'href',
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}?vote=${daoUtils.buildPluginUniqueId(stageBody)}&proposals=${daoUtils.buildPluginUniqueId(process)}`,
        );
    });

    // "In no process" and "not read yet" are different answers, and the row must only act on the first: naming a
    // process it cannot yet resolve is impossible, so the parameter is simply left off until it can.
    it('names no process while the processes of the account are unknown', () => {
        expect(
            renderMemberOfBody(governanceAddress, {
                [daoAccount.id]: { bodies: [body] },
            }),
        ).toHaveAttribute(
            'href',
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}?vote=${bodyId}`,
        );
    });

    // A membership-only plugin is in no process, so there is no process to open the proposals on and the row says
    // nothing about them.
    it('names no process for a body that is in none', () => {
        expect(
            renderMemberOfBody(governanceAddress, buildPlugins([body])),
        ).toHaveAttribute(
            'href',
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}?vote=${bodyId}`,
        );
    });

    // A hidden body reports no voting power and no balance on the member page, so a membership held only on one is
    // no reason to link there — the member page would report a body the member is not in.
    it('links a member of hidden bodies only to the address on the block explorer', () => {
        mockMembers([
            generateWorkspaceMember({
                network: Network.ETHEREUM_SEPOLIA,
                address: memberAddress,
                memberships: [
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: daoAddress,
                        },
                    }),
                ],
            }),
        ]);
        render(
            createTestComponent({
                visiblePluginsByAccountId: buildPlugins([
                    generateDaoPlugin({
                        address: '0x00000000000000000000000000000000000000Af',
                    }),
                ]),
            }),
        );

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'href',
            `https://explorer.test/address/${memberAddress}`,
        );
    });

    // An account whose bodies could not be read is absent from the map. Reading that as "no visible body" would turn
    // every one of its members into a link out of the workspace; the row links bare instead, and the member page
    // resolves a body for itself as it did before.
    it('links the members of an account whose bodies are unknown without naming a body', () => {
        mockMembers([
            generateWorkspaceMember({
                network: Network.ETHEREUM_SEPOLIA,
                address: memberAddress,
                memberships: [
                    generateWorkspaceMembership({
                        account: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: daoAddress,
                        },
                    }),
                ],
            }),
        ]);
        render(createTestComponent({ visiblePluginsByAccountId: {} }));

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'href',
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}`,
        );
    });

    // Resolved through the ENS module, not read off the endpoint, so a member reads the same here and on the account
    // members page — the Aragon registry suffix included.
    it('displays the ENS name resolved for the member', () => {
        useEnsNameSpy.mockReturnValue({
            data: 'member.eth',
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        mockMembers([
            generateWorkspaceMember({
                address: memberAddress,
                ens: 'stale.eth',
            }),
        ]);
        render(createTestComponent());

        expect(useEnsNameSpy).toHaveBeenCalledWith(memberAddress, {
            stripAragonRegistrySuffix: true,
        });
        expect(screen.getByText('member.eth')).toBeInTheDocument();
    });

    it('warns that the list is incomplete when an account could not be read', () => {
        mockMembers([generateWorkspaceMember()], { partial: true });
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceMemberList\.partial$/),
        ).toBeInTheDocument();
    });

    it('renders the empty state and disables the request when the workspace has no account', () => {
        render(createTestComponent({ accounts: [] }));

        expect(useWorkspaceMemberListSpy).toHaveBeenCalledWith(
            expect.anything(),
            { enabled: false },
        );
        expect(
            screen.getByText(/workspaceMemberList\.emptyState\.heading$/),
        ).toBeInTheDocument();
    });

    it('narrows the request to the given filters', () => {
        const filters = {
            network: Network.ETHEREUM_SEPOLIA,
            governanceAddress: '0xBody',
        };
        render(createTestComponent({ filters }));

        expect(useWorkspaceMemberListSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({ filters }),
            }),
            { enabled: true },
        );
    });

    // The aside card builds the same body to share the request, and the query key is the body: an empty `filters`
    // key on the unfiltered list would split the two into separate requests.
    it('omits the filters key entirely when no filters are given', () => {
        render(createTestComponent());

        expect(useWorkspaceMemberListSpy).toHaveBeenCalledWith(
            {
                body: {
                    accounts: [
                        {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: daoAddress,
                        },
                        {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: safeAddress,
                        },
                    ],
                    pagination: { pageSize: 18 },
                },
            },
            { enabled: true },
        );
    });
});
