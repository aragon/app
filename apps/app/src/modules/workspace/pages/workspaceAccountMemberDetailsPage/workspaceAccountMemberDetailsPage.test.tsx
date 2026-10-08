import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import type { ReactNode } from 'react';
import { DaoMemberDetailsPage } from '@/modules/governance/pages/daoMemberDetailsPage/daoMemberDetailsPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { workspaceQueryService } from '../../api/workspaceQueryService';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import {
    generateWorkspaceMember,
    generateWorkspaceMembership,
    generateWorkspaceQueryResponse,
} from '../../testUtils';
import {
    type IWorkspaceAccountMemberDetailsPageProps,
    WorkspaceAccountMemberDetailsPage,
} from './workspaceAccountMemberDetailsPage';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock(
    '@/modules/governance/pages/daoMemberDetailsPage/daoMemberDetailsPage',
    () => ({
        DaoMemberDetailsPage: jest.fn(() => (
            <div data-testid="dao-member-details-mock" />
        )),
    }),
);

jest.mock('../../components/workspaceAccountGate', () => ({
    WorkspaceAccountGate: jest.fn(({ children }: { children: ReactNode }) => (
        <div data-testid="account-gate-mock">{children}</div>
    )),
}));

jest.mock('@/shared/components/redirectToUrl', () => ({
    RedirectToUrl: jest.fn(({ url }: { url: string }) => (
        <div data-testid="redirect-mock">{url}</div>
    )),
}));

describe('<WorkspaceAccountMemberDetailsPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;
    const memberAddress = '0x1234567890123456789012345678901234567890';
    const governanceAddress = '0x2222222222222222222222222222222222222222';

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const getMemberListSpy = jest.spyOn(workspaceQueryService, 'getMemberList');
    const daoMemberDetailsPageMock = DaoMemberDetailsPage as jest.Mock;
    const accountGateMock = WorkspaceAccountGate as jest.Mock;

    /**
     * Mocks the lookup answering with a member of `governanceAddress` on the account of the URL.
     */
    const mockMembership = () =>
        getMemberListSpy.mockResolvedValue(
            generateWorkspaceQueryResponse({
                data: [
                    generateWorkspaceMember({
                        address: memberAddress,
                        memberships: [
                            generateWorkspaceMembership({
                                account: {
                                    network: Network.ETHEREUM_SEPOLIA,
                                    address,
                                },
                                governance: {
                                    address: governanceAddress,
                                    type: 'multisig',
                                },
                            }),
                        ],
                    }),
                ],
            }),
        );

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
        mockMembership();
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        getMemberListSpy.mockReset();
        notFoundMock.mockClear();
        daoMemberDetailsPageMock.mockClear();
        accountGateMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceAccountMemberDetailsPageProps>,
    ) => {
        const completeProps: IWorkspaceAccountMemberDetailsPageProps = {
            params: Promise.resolve({
                workspaceId: 'demo',
                accountId,
                address: memberAddress,
            }),
            ...props,
        };
        const Component =
            await WorkspaceAccountMemberDetailsPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders the DAO member page of the account behind the account gate', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(screen.getByTestId('account-gate-mock')).toBeInTheDocument();
        expect(
            screen.getByTestId('dao-member-details-mock'),
        ).toBeInTheDocument();
        expect(accountGateMock).toHaveBeenCalledWith(
            expect.objectContaining({ accountId }),
            undefined,
        );
    });

    it('hands the member page the account as DAO route parameters', async () => {
        render(await createTestComponent());

        const memberPageProps = daoMemberDetailsPageMock.mock.calls.at(
            -1,
        )?.[0] as { params: Promise<unknown> } | undefined;

        await expect(memberPageProps?.params).resolves.toEqual({
            network: Network.ETHEREUM_SEPOLIA,
            addressOrEns: address,
            address: memberAddress,
        });
    });

    // The account ID carries the network and the address, so no workspace registry read is needed to ask.
    it('looks the member up on the account of the URL alone', async () => {
        render(await createTestComponent());

        expect(getMemberListSpy).toHaveBeenCalledWith({
            body: {
                accounts: [{ network: Network.ETHEREUM_SEPOLIA, address }],
                filters: { memberAddress },
                pagination: { pageSize: 1 },
            },
        });
    });

    // Membership is plugin-scoped and the DAO page cannot know which body the member is in, so it is told.
    it('hands the member page the governance of the membership', async () => {
        render(await createTestComponent());

        expect(daoMemberDetailsPageMock).toHaveBeenCalledWith(
            expect.objectContaining({ bodyPluginId: governanceAddress }),
            undefined,
        );
    });

    // The rule the account selector applies when switching account, applied here to a stale or hand-edited URL.
    it('redirects to the account members page when the address is a member of nothing', async () => {
        getMemberListSpy.mockResolvedValue(
            generateWorkspaceQueryResponse({ data: [] }),
        );
        render(await createTestComponent());

        expect(screen.getByTestId('redirect-mock')).toHaveTextContent(
            `/workspace/demo/${accountId}/members`,
        );
        expect(daoMemberDetailsPageMock).not.toHaveBeenCalled();
    });

    // A failed lookup is not an answer: the page renders as it did before the lookup existed.
    it('renders the member page without a governance when the lookup fails', async () => {
        getMemberListSpy.mockRejectedValue(new Error('unavailable'));
        render(await createTestComponent());

        expect(
            screen.getByTestId('dao-member-details-mock'),
        ).toBeInTheDocument();
        expect(daoMemberDetailsPageMock).toHaveBeenCalledWith(
            expect.objectContaining({ bodyPluginId: undefined }),
            undefined,
        );
    });

    // An empty answer only means "a member of nothing" when the account behind it could be read. A partial one is
    // no more an answer than a thrown one, so it degrades the same way instead of redirecting a real member away.
    it('renders the member page without a governance when the account could not be read in full', async () => {
        getMemberListSpy.mockResolvedValue(
            generateWorkspaceQueryResponse({ data: [], partial: true }),
        );
        render(await createTestComponent());

        expect(screen.queryByTestId('redirect-mock')).not.toBeInTheDocument();
        expect(
            screen.getByTestId('dao-member-details-mock'),
        ).toBeInTheDocument();
        expect(daoMemberDetailsPageMock).toHaveBeenCalledWith(
            expect.objectContaining({ bodyPluginId: undefined }),
            undefined,
        );
    });

    // The rows of the member lists name the body they stood for, which is the whole question the lookup answers. It
    // rides on the parameter the page already carries for its vote list, so one value picks both.
    it('takes the body from the URL and asks the endpoint nothing', async () => {
        const linkedBody = '0x3333333333333333333333333333333333333333-slug';
        render(
            await createTestComponent({
                searchParams: Promise.resolve({ vote: linkedBody }),
            }),
        );

        expect(getMemberListSpy).not.toHaveBeenCalled();
        expect(daoMemberDetailsPageMock).toHaveBeenCalledWith(
            expect.objectContaining({ bodyPluginId: linkedBody }),
            undefined,
        );
    });

    // A URL that names a body opts out of the lookup, and therefore out of the redirect that goes with it. The DAO
    // page matches the address against the visible bodies and falls back to the first, so it cannot dead-end.
    it('does not redirect a URL that names a body', async () => {
        getMemberListSpy.mockResolvedValue(
            generateWorkspaceQueryResponse({ data: [] }),
        );
        render(
            await createTestComponent({
                searchParams: Promise.resolve({
                    vote: '0x3333333333333333333333333333333333333333-slug',
                }),
            }),
        );

        expect(screen.queryByTestId('redirect-mock')).not.toBeInTheDocument();
        expect(
            screen.getByTestId('dao-member-details-mock'),
        ).toBeInTheDocument();
    });

    // There is no sensible pick between two bodies, and the app never writes a repeated parameter, so a URL that
    // carries one is read as naming none and falls back to the lookup.
    it('falls back to the lookup when the URL repeats the body parameter', async () => {
        render(
            await createTestComponent({
                searchParams: Promise.resolve({
                    vote: ['0x3333333333333333333333333333333333333333', '0x4'],
                }),
            }),
        );

        expect(getMemberListSpy).toHaveBeenCalled();
        expect(daoMemberDetailsPageMock).toHaveBeenCalledWith(
            expect.objectContaining({ bodyPluginId: governanceAddress }),
            undefined,
        );
    });

    it('renders the 404 page when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
        expect(daoMemberDetailsPageMock).not.toHaveBeenCalled();
    });
});
