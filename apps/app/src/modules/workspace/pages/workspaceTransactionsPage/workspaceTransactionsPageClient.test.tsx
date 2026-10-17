import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDialogContext,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import type * as workspaceTransactionList from '../../components/workspaceTransactionList';
import { WorkspaceTransactionList } from '../../components/workspaceTransactionList';
import type * as workspaceTransactionsAsideCard from '../../components/workspaceTransactionsAsideCard';
import { WorkspaceTransactionsAsideCard } from '../../components/workspaceTransactionsAsideCard';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IWorkspaceSelectAccountDialogParams } from '../../dialogs/workspaceSelectAccountDialog';
import type {
    IUseWorkspaceAccountOptionsResult,
    IWorkspaceAccountOption,
} from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountsExecutePermissionModule from '../../hooks/useWorkspaceAccountsExecutePermission';
import * as useWorkspaceDaosModule from '../../hooks/useWorkspaceDaos';
import {
    type IWorkspaceTransactionsPageClientProps,
    WorkspaceTransactionsPageClient,
} from './workspaceTransactionsPageClient';

jest.mock('../../components/workspaceTransactionsAsideCard', () => ({
    WorkspaceTransactionsAsideCard: jest.fn(() => (
        <div data-testid="aside-card-mock" />
    )),
}));

jest.mock('../../components/workspaceTransactionList', () => ({
    WorkspaceTransactionList: jest.fn(() => <div data-testid="list-mock" />),
}));

describe('<WorkspaceTransactionsPageClient /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsModule,
        'useWorkspaceAccountOptions',
    );
    const useWorkspaceAccountsExecutePermissionSpy = jest.spyOn(
        useWorkspaceAccountsExecutePermissionModule,
        'useWorkspaceAccountsExecutePermission',
    );
    const useWorkspaceDaosSpy = jest.spyOn(
        useWorkspaceDaosModule,
        'useWorkspaceDaos',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');

    const openMock = jest.fn();
    const closeMock = jest.fn();
    const pushMock = jest.fn();

    const createActionName = /workspaceTransactionsPage\.main\.action$/;

    const listMock = WorkspaceTransactionList as jest.Mock;
    const asideCardMock = WorkspaceTransactionsAsideCard as jest.Mock;

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
        metadata: { name: 'Grants Safe' },
    };

    const allAccountsOption: IWorkspaceAccountOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

    const daoOption: IWorkspaceAccountOption = {
        id: daoAccount.id,
        label: 'Demo DAO',
        account: daoAccount,
        isAllAccounts: false,
    };

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'test-workspace',
        name: 'Test Workspace',
        description: 'A test workspace',
        avatar: null,
        links: [],
        owner: daoAddress,
        accounts: [daoAccount, safeAccount],
        targets: [],
        ...workspace,
    });

    /**
     * Mocks the hook as the aggregated route does, the overrides standing in for an account-scoped route. On the
     * aggregated route the DAO account is an option to switch to rather than the one being looked at.
     */
    const mockAccountOptions = (
        result?: Partial<IUseWorkspaceAccountOptionsResult>,
    ) =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [allAccountsOption, daoOption],
            accountId: allAccountsOption.id,
            activeOption: allAccountsOption,
            isAllAccounts: true,
            ...result,
        });

    /**
     * Props of the last render of the transaction list.
     */
    const lastListProps = () =>
        listMock.mock.calls.at(-1)?.[0] as
            | workspaceTransactionList.IWorkspaceTransactionListProps
            | undefined;

    /**
     * Props of the last render of the aside card.
     */
    const lastAsideCardProps = () =>
        asideCardMock.mock.calls.at(-1)?.[0] as
            | workspaceTransactionsAsideCard.IWorkspaceTransactionsAsideCardProps
            | undefined;

    /**
     * Mocks the execute-permission check. The default is the no-permission case, as on the DAO transactions page.
     */
    const mockExecutePermissions = (
        permissions: Record<string, boolean> = {},
        isPending = false,
    ) =>
        useWorkspaceAccountsExecutePermissionSpy.mockReturnValue({
            permissions,
            isPending,
        });

    /**
     * Params of the last account-selection dialog the page opened.
     */
    const lastDialogParams = () =>
        (
            openMock.mock.calls.at(-1)?.[1] as
                | { params: IWorkspaceSelectAccountDialogParams }
                | undefined
        )?.params;

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        mockAccountOptions();
        mockExecutePermissions();
        useWorkspaceDaosSpy.mockReturnValue({
            daos: {
                [daoAccount.id]: generateDao({
                    id: daoAccount.id,
                    address: daoAddress,
                    network: daoAccount.network,
                    ens: null,
                }),
            },
            isPending: false,
        });
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: openMock, close: closeMock }),
        );
        useRouterSpy.mockReturnValue({
            push: pushMock,
        } as unknown as AppRouterInstance);
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
        useWorkspaceAccountsExecutePermissionSpy.mockReset();
        useWorkspaceDaosSpy.mockReset();
        useDialogContextSpy.mockReset();
        useRouterSpy.mockReset();
        asideCardMock.mockClear();
        listMock.mockClear();
        openMock.mockClear();
        closeMock.mockClear();
        pushMock.mockClear();
    });

    let testIndex = 0;

    // The query client must sit inside the gov-ui-kit provider: that provider carries a query client of its own,
    // which would otherwise shadow this one and share its cache with every other test of this file.
    const createTestComponent = (
        props?: Partial<IWorkspaceTransactionsPageClientProps>,
    ) => {
        testIndex += 1;
        const completeProps: IWorkspaceTransactionsPageClientProps = {
            workspaceId: `test-workspace-${testIndex.toString()}`,
            pageSize: 20,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient()}>
                    <WorkspaceTransactionsPageClient {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('renders the aggregated list with every account of the workspace by default', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([
                daoAccount,
                safeAccount,
            ]),
        );
        expect(screen.getByTestId('list-mock')).toBeInTheDocument();
    });

    it('passes every account and the aggregated option to the aside card by default', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(lastAsideCardProps()).toEqual({
                accounts: [daoAccount, safeAccount],
                pageSize: 20,
                activeOption: allAccountsOption,
            }),
        );
    });

    it('narrows the list to the selected DAO account', async () => {
        mockAccountOptions({
            accountId: daoAccount.id,
            activeOption: daoOption,
            isAllAccounts: false,
        });
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
    });

    // Only DAO accounts become options, so the route of a Safe keeps the aggregated selection. A known gap, see
    // `docs/projectDocs/createWorkspace.md`.
    it('falls back to every account on the route of an account that is not an option', async () => {
        mockAccountOptions({
            accountId: safeAccount.id,
            activeOption: undefined,
            isAllAccounts: false,
        });
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([
                daoAccount,
                safeAccount,
            ]),
        );
    });

    // The card describes what the list shows, so both narrow from the same option rather than each resolving it.
    it('gives the aside card the same selection as the list under an account scope', async () => {
        mockAccountOptions({
            accountId: daoAccount.id,
            activeOption: daoOption,
            isAllAccounts: false,
        });
        render(createTestComponent());

        await waitFor(() =>
            expect(lastAsideCardProps()).toEqual({
                accounts: [daoAccount],
                pageSize: 20,
                activeOption: daoOption,
            }),
        );
    });

    it('lists the Safe accounts of a workspace without DAO accounts', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [safeAccount] }),
        );
        mockAccountOptions({ options: [allAccountsOption] });
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([safeAccount]),
        );
    });
    it('offers no create action when no account in view can be executed on', async () => {
        render(createTestComponent());

        await waitFor(() => expect(lastListProps()?.accounts).toHaveLength(2));
        expect(
            screen.queryByRole('button', { name: createActionName }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('link', { name: createActionName }),
        ).not.toBeInTheDocument();
    });

    // The selection dialog snapshots the permissions and destinations it is given, so an action offered while the
    // accounts that answered first say yes would freeze a disabled list that never catches up.
    it('offers no create action while the execute permissions are still being read', async () => {
        mockExecutePermissions({ [daoAccount.id]: true }, true);
        render(createTestComponent());

        await waitFor(() => expect(lastListProps()?.accounts).toHaveLength(2));
        expect(
            screen.queryByRole('button', { name: createActionName }),
        ).not.toBeInTheDocument();
    });

    it('offers no create action while the DAOs of the accounts are still being read', async () => {
        useWorkspaceDaosSpy.mockReturnValue({ daos: {}, isPending: true });
        mockExecutePermissions({ [daoAccount.id]: true });
        render(createTestComponent());

        await waitFor(() => expect(lastListProps()?.accounts).toHaveLength(2));
        expect(
            screen.queryByRole('button', { name: createActionName }),
        ).not.toBeInTheDocument();
    });

    it('offers no create action under an account scope while the reads are in flight', async () => {
        mockAccountOptions({
            accountId: daoAccount.id,
            activeOption: daoOption,
            isAllAccounts: false,
        });
        mockExecutePermissions({ [daoAccount.id]: true }, true);
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(
            screen.queryByRole('link', { name: createActionName }),
        ).not.toBeInTheDocument();
    });

    it('asks which account to use when several are in view, listing the ones that cannot be used as disabled', async () => {
        mockExecutePermissions({ [daoAccount.id]: true });
        render(createTestComponent());

        const action = await screen.findByRole('button', {
            name: createActionName,
        });
        await userEvent.click(action);

        expect(openMock).toHaveBeenCalledWith(
            WorkspaceDialogId.SELECT_ACCOUNT,
            expect.anything(),
        );
        expect(lastDialogParams()).toEqual(
            expect.objectContaining({
                accounts: [daoAccount, safeAccount],
                variant: 'transaction',
                disabledAccountIds: [safeAccount.id],
            }),
        );
    });

    it('closes the selection and opens the create flow of the account that was picked', async () => {
        mockExecutePermissions({ [daoAccount.id]: true });
        render(createTestComponent());

        await userEvent.click(
            await screen.findByRole('button', { name: createActionName }),
        );
        lastDialogParams()?.onAccountSelected(daoAccount);

        expect(closeMock).toHaveBeenCalledWith(
            WorkspaceDialogId.SELECT_ACCOUNT,
        );
        expect(pushMock).toHaveBeenCalledWith(
            `/dao/${daoAccount.network}/${daoAddress}/create/execute`,
        );
    });

    // The permission and the DAO come from different services, so holding the permission is not enough: an account
    // whose DAO could not be read has no destination and must not be offered.
    it('does not offer an account the wallet may execute on but whose DAO could not be read', async () => {
        useWorkspaceDaosSpy.mockReturnValue({ daos: {}, isPending: false });
        mockExecutePermissions({ [daoAccount.id]: true });
        render(createTestComponent());

        await waitFor(() => expect(lastListProps()?.accounts).toHaveLength(2));
        expect(
            screen.queryByRole('button', { name: createActionName }),
        ).not.toBeInTheDocument();
    });

    it('disables an account without a destination in the selection it opens', async () => {
        const otherAddress = '0xB941b1C1D9aDC88C9241aA3ACA59E8B8f0386420';
        const unreadableAccount: IWorkspaceAccount = {
            id: `${Network.ETHEREUM_SEPOLIA}-${otherAddress}`,
            type: WorkspaceAccountType.DAO,
            address: otherAddress,
            network: Network.ETHEREUM_SEPOLIA,
        };
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [daoAccount, unreadableAccount] }),
        );
        mockExecutePermissions({
            [daoAccount.id]: true,
            [unreadableAccount.id]: true,
        });
        render(createTestComponent());

        await userEvent.click(
            await screen.findByRole('button', { name: createActionName }),
        );

        expect(lastDialogParams()?.disabledAccountIds).toEqual([
            unreadableAccount.id,
        ]);
    });

    // The account is on the path already, so there is nothing to ask and the action is a plain link.
    it('links straight to the create flow of the account under an account scope', async () => {
        mockAccountOptions({
            accountId: daoAccount.id,
            activeOption: daoOption,
            isAllAccounts: false,
        });
        mockExecutePermissions({ [daoAccount.id]: true });
        render(createTestComponent());

        const action = await screen.findByRole('link', {
            name: createActionName,
        });

        expect(action).toHaveAttribute(
            'href',
            `/dao/${daoAccount.network}/${daoAddress}/create/execute`,
        );
        // A link rather than the button the aggregated scope renders, so there is no selection step to open.
        expect(
            screen.queryByRole('button', { name: createActionName }),
        ).not.toBeInTheDocument();
        expect(openMock).not.toHaveBeenCalled();
    });

    // What keeps an account-scoped route from reading the permission of every account of the workspace.
    it('checks the permission of the account in scope only', async () => {
        mockAccountOptions({
            accountId: daoAccount.id,
            activeOption: daoOption,
            isAllAccounts: false,
        });
        render(createTestComponent());

        await waitFor(() =>
            expect(
                useWorkspaceAccountsExecutePermissionSpy,
            ).toHaveBeenCalledWith([daoAccount]),
        );
    });

    it('offers no create action under an account scope the wallet cannot execute on', async () => {
        mockAccountOptions({
            accountId: daoAccount.id,
            activeOption: daoOption,
            isAllAccounts: false,
        });
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(
            screen.queryByRole('link', { name: createActionName }),
        ).not.toBeInTheDocument();
    });
});
