import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound, redirect } from 'next/navigation-original';
import { DaoMemberDetailsPage } from '@/modules/governance/pages/daoMemberDetailsPage/daoMemberDetailsPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { workspaceQueryService } from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import {
    generateWorkspaceMember,
    generateWorkspaceMembership,
    generateWorkspaceQueryResponse,
} from '../../testUtils';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    type IWorkspaceAccountMemberDetailsPageProps,
    WorkspaceAccountMemberDetailsPage,
} from './workspaceAccountMemberDetailsPage';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
    redirect: jest.fn(() => {
        throw new Error('NEXT_REDIRECT');
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

describe('<WorkspaceAccountMemberDetailsPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;
    const memberAddress = '0x1234567890123456789012345678901234567890';
    const governanceAddress = '0x2222222222222222222222222222222222222222';

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const getMemberListSpy = jest.spyOn(workspaceQueryService, 'getMemberList');
    const resolveAccountTypeSpy = jest.spyOn(
        workspaceAccountInfoUtils,
        'resolveAccountType',
    );
    const daoMemberDetailsPageMock = DaoMemberDetailsPage as jest.Mock;
    const redirectMock = redirect as jest.MockedFunction<typeof redirect>;

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
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.DAO);
        mockMembership();
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        getMemberListSpy.mockReset();
        resolveAccountTypeSpy.mockReset();
        notFoundMock.mockClear();
        daoMemberDetailsPageMock.mockClear();
        redirectMock.mockClear();
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

    /**
     * The search parameters the DAO member page was last handed, through which the body it reads is named.
     */
    const readHandedSearchParams = () =>
        (
            daoMemberDetailsPageMock.mock.calls.at(-1)?.[0] as
                | { searchParams?: Promise<unknown> }
                | undefined
        )?.searchParams;

    it('renders the DAO member page of the account', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(
            screen.getByTestId('dao-member-details-mock'),
        ).toBeInTheDocument();
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

        await expect(readHandedSearchParams()).resolves.toEqual({
            members: governanceAddress,
        });
    });

    // The rule the account selector applies when switching account, applied here to a stale or hand-edited URL.
    it('redirects to the account members page when the address is a member of nothing', async () => {
        getMemberListSpy.mockResolvedValue(
            generateWorkspaceQueryResponse({ data: [] }),
        );
        await expect(createTestComponent()).rejects.toThrow('NEXT_REDIRECT');

        expect(redirectMock).toHaveBeenCalledWith(
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
        await expect(readHandedSearchParams()).resolves.toEqual({
            members: undefined,
        });
    });

    // An empty answer only means "a member of nothing" when the account behind it could be read. A partial one is
    // no more an answer than a thrown one, so it degrades the same way instead of redirecting a real member away.
    it('renders the member page without a governance when the account could not be read in full', async () => {
        getMemberListSpy.mockResolvedValue(
            generateWorkspaceQueryResponse({ data: [], partial: true }),
        );
        render(await createTestComponent());

        expect(redirectMock).not.toHaveBeenCalled();
        expect(
            screen.getByTestId('dao-member-details-mock'),
        ).toBeInTheDocument();
        await expect(readHandedSearchParams()).resolves.toEqual({
            members: undefined,
        });
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
        await expect(readHandedSearchParams()).resolves.toEqual({
            members: linkedBody,
        });
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

        expect(redirectMock).not.toHaveBeenCalled();
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
        await expect(readHandedSearchParams()).resolves.toEqual({
            members: governanceAddress,
        });
    });

    describe('Safe account', () => {
        const safeMembersUrl = workspaceUtils.getAccountScopeUrl(
            'demo',
            accountId,
            'members',
        );

        beforeEach(() => {
            resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.SAFE);
        });

        it('redirects a Safe account to its members page', async () => {
            await expect(createTestComponent()).rejects.toThrow(
                'NEXT_REDIRECT',
            );

            expect(redirectMock).toHaveBeenCalledWith(safeMembersUrl);
            expect(daoMemberDetailsPageMock).not.toHaveBeenCalled();
        });

        it('does not look the member up for a Safe account', async () => {
            await expect(createTestComponent()).rejects.toThrow(
                'NEXT_REDIRECT',
            );

            expect(getMemberListSpy).not.toHaveBeenCalled();
        });

        // Called with the members URL alone, so the body parameter of the original URL does not carry over.
        it('drops the body parameter when redirecting a Safe account', async () => {
            await expect(
                createTestComponent({
                    searchParams: Promise.resolve({ vote: 'x' }),
                }),
            ).rejects.toThrow('NEXT_REDIRECT');

            expect(redirectMock).toHaveBeenCalledWith(safeMembersUrl);
        });
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
