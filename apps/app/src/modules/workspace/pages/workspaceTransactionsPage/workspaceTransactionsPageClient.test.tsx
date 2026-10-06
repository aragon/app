import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
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
import type {
    IUseWorkspaceAccountOptionsResult,
    IWorkspaceAccountOption,
} from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
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

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        mockAccountOptions();
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
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
});
