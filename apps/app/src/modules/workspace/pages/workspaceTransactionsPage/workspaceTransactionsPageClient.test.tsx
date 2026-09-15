import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
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
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');

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

    const allAccountsLabel =
        'app.workspace.workspaceTransactionsPage.filter.allAccounts';

    /**
     * Opens the account dropdown, whose trigger is labelled by the option currently selected.
     */
    const openAccountFilter = async (activeLabel: string) =>
        await userEvent.click(
            await screen.findByRole('button', { name: activeLabel }),
        );

    const selectAccount = async (activeLabel: string, label: string) => {
        await openAccountFilter(activeLabel);
        await userEvent.click(await screen.findByText(label));
    };

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        getAccountsSpy.mockResolvedValue([
            {
                network: Network.ETHEREUM_SEPOLIA,
                address: daoAddress,
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                indexed: true,
                name: 'Demo DAO',
            },
        ]);
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
        asideCardMock.mockClear();
        listMock.mockClear();
        localStorage.clear();
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

    it('offers the aggregated option and the DAO accounts only', async () => {
        render(createTestComponent());

        await openAccountFilter(allAccountsLabel);

        expect(await screen.findByText('Demo DAO')).toBeInTheDocument();
        // The Safe has no option: the single DAO endpoints cannot answer for it.
        expect(screen.queryByText('Grants Safe')).not.toBeInTheDocument();
        expect(
            screen.queryByText(addressUtils.truncateAddress(safeAddress)),
        ).not.toBeInTheDocument();
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
        render(createTestComponent());

        await selectAccount(allAccountsLabel, 'Demo DAO');

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(screen.getByTestId('list-mock')).toBeInTheDocument();
    });

    it('lists every account again when the all-accounts option is selected back', async () => {
        render(createTestComponent());

        await selectAccount(allAccountsLabel, 'Demo DAO');
        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );

        await selectAccount('Demo DAO', allAccountsLabel);

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([
                daoAccount,
                safeAccount,
            ]),
        );
    });

    it('passes the workspace and the aggregated option to the aside card by default', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(lastAsideCardProps()).toEqual({
                workspace: buildWorkspace(),
                pageSize: 20,
                activeOption: expect.objectContaining({ isAllAccounts: true }),
            }),
        );
    });

    it('passes the selected account option to the aside card', async () => {
        render(createTestComponent());

        await selectAccount(allAccountsLabel, 'Demo DAO');

        await waitFor(() =>
            expect(lastAsideCardProps()?.activeOption).toEqual(
                expect.objectContaining({
                    label: 'Demo DAO',
                    account: daoAccount,
                }),
            ),
        );
    });

    it('does not offer the account filter for a workspace without DAO accounts', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [safeAccount] }),
        );
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([safeAccount]),
        );
        expect(
            screen.queryByRole('button', { name: allAccountsLabel }),
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

    it('does not resolve account names for a workspace that has none', async () => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace({ accounts: [] }));
        render(createTestComponent());

        await waitFor(() => expect(lastListProps()?.accounts).toEqual([]));
        expect(getAccountsSpy).not.toHaveBeenCalled();
    });
});
