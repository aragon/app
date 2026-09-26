import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import * as workspaceAccountSelectorProvider from '../../components/workspaceAccountSelectorProvider';
import type * as workspaceTransactionList from '../../components/workspaceTransactionList';
import { WorkspaceTransactionList } from '../../components/workspaceTransactionList';
import type * as workspaceTransactionsAsideCard from '../../components/workspaceTransactionsAsideCard';
import { WorkspaceTransactionsAsideCard } from '../../components/workspaceTransactionsAsideCard';
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
    const useWorkspaceAccountSelectorContextSpy = jest.spyOn(
        workspaceAccountSelectorProvider,
        'useWorkspaceAccountSelectorContext',
    );
    const setActiveOptionMock = jest.fn();

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

    const allAccountsOption: workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption =
        { id: 'all', label: 'All accounts', isAllAccounts: true };

    const daoOption: workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption =
        {
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
     * Mocks the account selector context, the aggregated option being active unless set otherwise.
     */
    const mockAccountSelector = (
        context?: Partial<workspaceAccountSelectorProvider.IWorkspaceAccountSelectorContext>,
    ) =>
        useWorkspaceAccountSelectorContextSpy.mockReturnValue({
            activeOption: allAccountsOption,
            setActiveOption: setActiveOptionMock,
            options: [allAccountsOption, daoOption],
            ...context,
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

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        mockAccountSelector();
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        useWorkspaceAccountSelectorContextSpy.mockReset();
        setActiveOptionMock.mockReset();
        asideCardMock.mockClear();
        listMock.mockClear();
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

    it('selects the account picked on the account dropdown', async () => {
        render(createTestComponent());

        await userEvent.click(
            await screen.findByRole('button', {
                name: allAccountsOption.label,
            }),
        );
        await userEvent.click(await screen.findByText(daoOption.label));

        expect(setActiveOptionMock).toHaveBeenCalledWith(daoOption);
    });

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

    it('narrows the list to the selected account', async () => {
        mockAccountSelector({ activeOption: daoOption });
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(screen.getByTestId('list-mock')).toBeInTheDocument();
    });

    it('passes the workspace and the aggregated option to the aside card by default', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(lastAsideCardProps()).toEqual({
                workspace: buildWorkspace(),
                pageSize: 20,
                activeOption: allAccountsOption,
            }),
        );
    });

    it('passes the selected account option to the aside card', async () => {
        mockAccountSelector({ activeOption: daoOption });
        render(createTestComponent());

        await waitFor(() =>
            expect(lastAsideCardProps()?.activeOption).toEqual(daoOption),
        );
    });

    it('does not offer the account filter for a workspace without DAO accounts', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [safeAccount] }),
        );
        mockAccountSelector({ options: [allAccountsOption] });
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([safeAccount]),
        );
        expect(
            screen.queryByRole('button', { name: allAccountsOption.label }),
        ).toBeNull();
    });

    it('displays an empty state when the workspace does not exist', async () => {
        getWorkspaceSpy.mockRejectedValue(new Error('not found'));
        render(createTestComponent());

        expect(
            await screen.findByText(
                /workspaceTransactionsPage\.notFound\.title$/,
            ),
        ).toBeInTheDocument();
    });
});
