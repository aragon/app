import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { daoService, type IDao, Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDaoPlugin,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    useWorkspace,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import type { IWorkspaceProposalListProps } from '../../components/workspaceProposalList';
import type { IWorkspaceProposalsAsideCardProps } from '../../components/workspaceProposalsAsideCard';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type {
    IUseWorkspaceAccountOptionsResult,
    IWorkspaceAccountOption,
} from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
import type { IWorkspaceProposalTab } from '../../hooks/useWorkspaceProposalTabs';
import * as useWorkspaceProposalTabsModule from '../../hooks/useWorkspaceProposalTabs';
import {
    type IWorkspaceProposalsPageClientProps,
    WorkspaceProposalsPageClient,
} from './workspaceProposalsPageClient';

jest.mock('@/modules/dashboard/components/telegramSubscriptionCard', () => ({
    TelegramSubscriptionCard: jest.fn(() => (
        <div data-testid="telegram-subscription-mock" />
    )),
}));

jest.mock('../../components/workspaceProposalList', () => ({
    WorkspaceProposalList: jest.fn(() => <div data-testid="list-mock" />),
}));

jest.mock('../../components/workspaceProposalsAsideCard', () => ({
    WorkspaceProposalsAsideCard: jest.fn(() => (
        <div data-testid="aside-card-mock" />
    )),
}));

describe('<WorkspaceProposalsPageClient /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const otherDaoAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsModule,
        'useWorkspaceAccountOptions',
    );
    const useWorkspaceProposalTabsSpy = jest.spyOn(
        useWorkspaceProposalTabsModule,
        'useWorkspaceProposalTabs',
    );

    const openMock = jest.fn();

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const otherDaoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${otherDaoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: otherDaoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const allAccountsOption: IWorkspaceAccountOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
        isExternal: false,
    };

    const daoOption: IWorkspaceAccountOption = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        label: 'Demo DAO',
        account: daoAccount,
        isAllAccounts: false,
        isExternal: false,
    };

    /**
     * Mocks the hook as an account-scoped route resolves it, i.e. with the option of that account active.
     */
    const mockAccountScope = () =>
        mockAccountOptions({
            options: [allAccountsOption, daoOption],
            accountId: daoOption.id,
            activeOption: daoOption,
            isAllAccounts: false,
        });

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'demo',
        name: 'Test Workspace',
        description: '',
        avatar: null,
        links: [],
        accounts: [daoAccount, safeAccount],
        targets: [],
        ...workspace,
    });

    const mockAccountOptions = (
        result?: Partial<IUseWorkspaceAccountOptionsResult>,
    ) =>
        useWorkspaceAccountOptionsSpy.mockImplementation(() => {
            // The page reads its accounts from the hook, derived here like the hook does: every account of the
            // workspace the test resolves on the aggregated scope, the account of the active option otherwise.
            const { data: workspace } = useWorkspace({
                urlParams: { id: 'demo' },
            });
            const activeOption =
                result != null && 'activeOption' in result
                    ? result.activeOption
                    : allAccountsOption;
            const isAllAccounts = result?.isAllAccounts ?? true;

            return {
                options: [allAccountsOption],
                accountId: allAccountsOption.id,
                activeOption,
                isAllAccounts,
                scopedAccounts: isAllAccounts
                    ? (workspace?.accounts ?? [])
                    : activeOption?.account != null
                      ? [activeOption.account]
                      : [],
                isPending: workspace == null,
                ...result,
            };
        });

    /**
     * Mocks the shared tabs hook, defaulting to the group tab being active, i.e. no process selected.
     */
    const mockProposalTabs = (activeTab?: IWorkspaceProposalTab) =>
        useWorkspaceProposalTabsSpy.mockReturnValue({
            filterTabs: [],
            hasTabs: activeTab != null,
            activeTab,
        });

    const buildProcessTab = (account: IWorkspaceAccount) =>
        ({
            accountId: account.id,
            id: 'multisig',
            uniqueId: `${account.network}-0xMultisig-mul`,
            label: 'Multisig',
            meta: generateDaoPlugin({ address: '0xMultisig', slug: 'mul' }),
            props: {},
        }) as IWorkspaceProposalTab;

    const lastTelegramCardProps = () =>
        (
            jest.requireMock(
                '@/modules/dashboard/components/telegramSubscriptionCard',
            ).TelegramSubscriptionCard as jest.Mock
        ).mock.calls.at(-1)?.[0] as { daoId: string } | undefined;

    // The list mock is module scoped, so calls from earlier tests would otherwise count: it is cleared between
    // tests like the other mocks, which is what lets a test assert the list was never rendered.
    const proposalListMock = jest.requireMock(
        '../../components/workspaceProposalList',
    ).WorkspaceProposalList as jest.Mock;

    const lastListProps = () =>
        proposalListMock.mock.calls.at(-1)?.[0] as
            | IWorkspaceProposalListProps
            | undefined;

    const lastAsideCardProps = () =>
        (
            jest.requireMock('../../components/workspaceProposalsAsideCard')
                .WorkspaceProposalsAsideCard as jest.Mock
        ).mock.calls.at(-1)?.[0] as
            | IWorkspaceProposalsAsideCardProps
            | undefined;

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        getDaoSpy.mockResolvedValue(generateDao({ id: daoAccount.id }));
        mockAccountOptions();
        mockProposalTabs();
        useDialogContextSpy.mockReturnValue({
            open: openMock,
            close: jest.fn(),
        } as unknown as ReturnType<typeof dialogProvider.useDialogContext>);
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getDaoSpy.mockReset();
        useDialogContextSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
        useWorkspaceProposalTabsSpy.mockReset();
        openMock.mockClear();
        proposalListMock.mockClear();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceProposalsPageClientProps>,
    ) => {
        const completeProps: IWorkspaceProposalsPageClientProps = {
            workspaceId: 'demo',
            pageSize: 10,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceProposalsPageClient {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    // Only DAO accounts have indexed proposals, so a Safe never reaches the list.
    it('lists the proposals of every DAO account of the workspace', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(screen.getByTestId('list-mock')).toBeInTheDocument();
    });

    it('passes the workspace id to the list, which links each row into the workspace', async () => {
        render(createTestComponent({ workspaceId: 'demo' }));

        await waitFor(() =>
            expect(lastListProps()?.workspaceId).toEqual('demo'),
        );
    });

    it('passes the page size to the list and the aside card, so both read under one key', async () => {
        render(createTestComponent({ pageSize: 25 }));

        await waitFor(() => expect(lastListProps()?.pageSize).toEqual(25));
        expect(lastAsideCardProps()?.pageSize).toEqual(25);
    });

    it('describes the whole workspace on the aside', async () => {
        render(createTestComponent());

        // Waits on the accounts rather than the option: the option comes from the hook on the first render, while
        // the accounts only arrive once the workspace resolves.
        await waitFor(() =>
            expect(lastAsideCardProps()?.accounts).toEqual([daoAccount]),
        );
        expect(lastAsideCardProps()?.activeOption).toEqual(allAccountsOption);
    });

    // The page aggregates every account, so which one a new proposal belongs to is always the first thing to ask.
    it('asks which account a new proposal belongs to', async () => {
        render(createTestComponent());

        await userEvent.click(
            await screen.findByRole('button', {
                name: /workspaceProposalsPage\.main\.action$/,
            }),
        );

        expect(openMock).toHaveBeenCalledWith(
            WorkspaceDialogId.SELECT_ACCOUNT,
            expect.objectContaining({
                params: expect.objectContaining({
                    accounts: [daoAccount],
                    variant: 'proposal',
                }),
            }),
        );
    });

    // The create flow resolves its destination from the DAOs, so the action waits for them.
    it('offers proposal creation only once the DAOs of the workspace are loaded', async () => {
        let resolveDao: (dao: IDao) => void = () => undefined;
        getDaoSpy.mockReturnValue(
            new Promise((resolve) => {
                resolveDao = resolve;
            }),
        );
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(
            screen.queryByRole('button', {
                name: /workspaceProposalsPage\.main\.action$/,
            }),
        ).not.toBeInTheDocument();

        resolveDao(generateDao({ id: daoAccount.id }));

        expect(
            await screen.findByRole('button', {
                name: /workspaceProposalsPage\.main\.action$/,
            }),
        ).toBeInTheDocument();
    });

    it('offers no proposal creation for a workspace without DAO accounts', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [safeAccount] }),
        );
        render(createTestComponent());

        await waitFor(() => expect(lastListProps()?.accounts).toEqual([]));
        expect(
            screen.queryByRole('button', {
                name: /workspaceProposalsPage\.main\.action$/,
            }),
        ).not.toBeInTheDocument();
    });
    it('narrows the list and the aside to the account the route names', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [daoAccount, safeAccount] }),
        );
        mockAccountScope();
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(lastAsideCardProps()?.accounts).toEqual([daoAccount]);
        expect(lastAsideCardProps()?.activeOption).toEqual(daoOption);
    });

    // The route has already answered which account, so the selection starts at the process.
    it('skips the account step when creating a proposal under an account scope', async () => {
        mockAccountScope();
        render(createTestComponent());

        await userEvent.click(
            await screen.findByRole('button', {
                name: /workspaceProposalsPage\.main\.action$/,
            }),
        );

        expect(openMock).toHaveBeenCalledWith(
            GovernanceDialogId.SELECT_PLUGIN,
            expect.objectContaining({
                params: expect.objectContaining({
                    daoId: daoAccount.id,
                    variant: 'process',
                    // No step underneath to go back to, so the dialog is not stacked and offers no back action.
                    onBack: undefined,
                }),
                stack: false,
            }),
        );
        expect(openMock).not.toHaveBeenCalledWith(
            WorkspaceDialogId.SELECT_ACCOUNT,
            expect.anything(),
        );
    });

    it('still aggregates every DAO account on the all-accounts route', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({
                accounts: [daoAccount, otherDaoAccount, safeAccount],
            }),
        );
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([
                daoAccount,
                otherDaoAccount,
            ]),
        );
        expect(lastListProps()?.isAccountScoped).toBeFalsy();
    });

    // `LayoutWorkspaceAccount` accepts any casing and the hook resolves it to the option of the account, so a
    // lowercased shared link narrows the page like the checksummed one.
    it('narrows to a DAO account the workspace does not hold', async () => {
        const externalOption: IWorkspaceAccountOption = {
            ...daoOption,
            isExternal: true,
        };
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [otherDaoAccount] }),
        );
        mockAccountOptions({
            accountId: daoAccount.id,
            activeOption: externalOption,
            isAllAccounts: false,
        });
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(lastListProps()?.isAccountScoped).toBeTruthy();
    });

    // Until the type of an external account is resolved there is no account to narrow to, and the page must not
    // widen to every DAO account of the workspace in the meantime.
    it('lists no account while the account the route names is being resolved', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [daoAccount, otherDaoAccount] }),
        );
        mockAccountOptions({
            accountId: daoAccount.id,
            activeOption: {
                id: daoAccount.id,
                label: '0x…',
                isAllAccounts: false,
                isExternal: true,
            },
            isAllAccounts: false,
            isPending: true,
        });
        render(createTestComponent());

        await waitFor(() => expect(lastListProps()?.accounts).toEqual([]));
        // The list loads rather than reading an empty selection as a workspace with no proposals.
        expect(lastListProps()?.isPending).toBeTruthy();
    });

    // The gate only proves on the server that the DAO loads; the client lookup is a request of its own.
    it('renders the state of an external account the lookup cannot place, without a retry', async () => {
        const useParamsSpy = jest
            .spyOn(NextNavigation, 'useParams')
            .mockReturnValue({ workspaceId: 'demo' });
        mockAccountOptions({
            accountId: daoAccount.id,
            activeOption: {
                id: daoAccount.id,
                label: '0x…',
                isAllAccounts: false,
                isExternal: true,
                accountState: WorkspaceAccountState.UNAVAILABLE,
            },
            isAllAccounts: false,
            isPending: false,
        });
        render(createTestComponent());

        expect(
            await screen.findByText(/unavailable\.heading$/),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /unavailable\.action$/ }),
        ).not.toBeInTheDocument();
        expect(proposalListMock).not.toHaveBeenCalled();
        expect(screen.queryByTestId('aside-card-mock')).not.toBeInTheDocument();
        useParamsSpy.mockRestore();
    });

    it('narrows to the account of a lowercased route ID', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [daoAccount, otherDaoAccount] }),
        );
        mockAccountOptions({
            options: [allAccountsOption, daoOption],
            accountId: daoOption.id.toLowerCase(),
            activeOption: daoOption,
            isAllAccounts: false,
        });
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(lastListProps()?.isAccountScoped).toBeTruthy();
        // The aside names the account too, rather than falling back to the aggregated card.
        expect(lastAsideCardProps()?.activeOption).toEqual(daoOption);
    });
    // A Telegram subscription is bound to one DAO, so the card needs exactly one account in view.
    it('offers the notifications of the account the route names', async () => {
        mockAccountScope();
        render(createTestComponent());

        expect(
            await screen.findByTestId('telegram-subscription-mock'),
        ).toBeInTheDocument();
        expect(lastTelegramCardProps()?.daoId).toEqual(daoAccount.id);
    });

    // One DAO in view is one DAO to subscribe to, whether or not the route is the one that narrowed it: on a
    // workspace holding a single DAO the aggregated route shows exactly that DAO's proposals.
    it('offers the notifications of the only DAO of the workspace under the aggregated scope', async () => {
        render(createTestComponent());

        expect(
            await screen.findByTestId('telegram-subscription-mock'),
        ).toBeInTheDocument();
        expect(lastTelegramCardProps()?.daoId).toEqual(daoAccount.id);
    });

    it('offers no notifications while several DAOs are in view', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [daoAccount, otherDaoAccount] }),
        );
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([
                daoAccount,
                otherDaoAccount,
            ]),
        );
        expect(
            screen.queryByTestId('telegram-subscription-mock'),
        ).not.toBeInTheDocument();
    });

    // A process belongs to one DAO, so selecting one narrows the view to a single DAO even across accounts.
    it('offers the notifications of the DAO a selected process belongs to', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [daoAccount, otherDaoAccount] }),
        );
        mockProposalTabs(buildProcessTab(otherDaoAccount));
        render(createTestComponent());

        expect(
            await screen.findByTestId('telegram-subscription-mock'),
        ).toBeInTheDocument();
        expect(lastTelegramCardProps()?.daoId).toEqual(otherDaoAccount.id);
    });

    // The aside is handed the selected tab rather than resolving it again, so it cannot describe another one.
    it('hands the selected process tab to the aside card', async () => {
        const tab = buildProcessTab(daoAccount);
        mockProposalTabs(tab);
        render(createTestComponent());

        await waitFor(() => expect(lastAsideCardProps()?.activeTab).toBe(tab));
    });
});
