import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import * as ensModule from '@/modules/ens';
import { Network } from '@/shared/api/daoService';
import * as useDaoChainHook from '@/shared/hooks/useDaoChain';
import {
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
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
    type IWorkspaceMemberListDefaultProps,
    WorkspaceMemberListDefault,
} from './workspaceMemberListDefault';

describe('<WorkspaceMemberListDefault /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c';
    const memberAddress = '0x1234567890123456789012345678901234567890';

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

    it('links a member to its member page under its first DAO account', () => {
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
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}`,
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
            `/workspace/demo/${daoAccount.id}/members/${memberAddress}`,
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
            `/workspace/demo/${daoAccount.id}/members/${checksummed}`,
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
