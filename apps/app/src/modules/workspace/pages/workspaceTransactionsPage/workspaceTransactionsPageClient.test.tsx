import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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
import {
    type IWorkspaceTransactionsPageClientProps,
    WorkspaceTransactionsPageClient,
} from './workspaceTransactionsPageClient';

jest.mock('../../components/workspaceTransactionList', () => ({
    WorkspaceTransactionList: jest.fn(() => <div data-testid="list-mock" />),
}));

describe('<WorkspaceTransactionsPageClient /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');

    const listMock = WorkspaceTransactionList as jest.Mock;

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
     * Props of the last render of the list, which is where the page reports its account selection.
     */
    const lastListProps = () =>
        listMock.mock.calls.at(-1)?.[0] as
            | workspaceTransactionList.IWorkspaceTransactionListProps
            | undefined;

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
            initialParams: { queryParams: { pageSize: 20 } },
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

    it('labels the account options with the resolved DAO name and the stored metadata name', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accountFilter?.options).toEqual([
                {
                    id: 'all',
                    label: 'app.workspace.workspaceTransactionsPage.accountFilter.all',
                },
                { id: daoAccount.id, label: 'Demo DAO' },
                { id: safeAccount.id, label: 'Grants Safe' },
            ]),
        );
    });

    it('selects every account of the workspace by default', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([
                daoAccount,
                safeAccount,
            ]),
        );
    });

    it('narrows the list to the selected account', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accountFilter).toBeDefined(),
        );
        lastListProps()?.accountFilter?.onSelect(safeAccount.id);

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([safeAccount]),
        );
    });

    it('restores every account when the all option is selected back', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accountFilter).toBeDefined(),
        );
        lastListProps()?.accountFilter?.onSelect(daoAccount.id);
        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );

        lastListProps()?.accountFilter?.onSelect('all');

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([
                daoAccount,
                safeAccount,
            ]),
        );
    });

    it('does not offer the account filter for a workspace with a single account', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [daoAccount] }),
        );
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(lastListProps()?.accountFilter).toBeUndefined();
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
