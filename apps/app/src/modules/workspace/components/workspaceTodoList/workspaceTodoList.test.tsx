import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateProposal } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import {
    generateDao,
    generateSafeInfo,
    generateSafeTransaction,
} from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceTodoItem,
    WorkspaceTodoType,
} from '../../hooks/useWorkspaceTodoData';
import type { IUseWorkspaceTodoListDataResult } from '../../hooks/useWorkspaceTodoListData';
import * as useWorkspaceTodoListDataModule from '../../hooks/useWorkspaceTodoListData';
import {
    type IWorkspaceTodoListProps,
    WorkspaceTodoList,
} from './workspaceTodoList';
import type { IWorkspaceTodoListItemProps } from './workspaceTodoListItem';

// The row is tested on its own; here it only needs to say which to-do it renders.
jest.mock('./workspaceTodoListItem', () => ({
    WorkspaceTodoListItem: (props: IWorkspaceTodoListItemProps) => (
        <p>{`todo-row ${props.todo.type} ${props.workspaceId}`}</p>
    ),
}));

describe('<WorkspaceTodoList /> component', () => {
    const useWorkspaceTodoListDataSpy = jest.spyOn(
        useWorkspaceTodoListDataModule,
        'useWorkspaceTodoListData',
    );

    const account: IWorkspaceAccount = {
        id: 'ethereum-sepolia-0xDao',
        type: WorkspaceAccountType.DAO,
        network: Network.ETHEREUM_SEPOLIA,
        address: '0xDao',
    };

    const buildProposalTodo = (id: string): IWorkspaceTodoItem => ({
        type: WorkspaceTodoType.PROPOSAL,
        proposal: { ...generateProposal({ id }), voteEndDate: 1_800_000_000 },
        dao: generateDao(),
    });
    const transactionTodo: IWorkspaceTodoItem = {
        type: WorkspaceTodoType.TRANSACTION,
        account,
        safeInfo: generateSafeInfo(),
        transaction: generateSafeTransaction({ safeTxHash: '0xTx' }),
        hasNonceRival: false,
    };

    const mockListData = (result?: Partial<IUseWorkspaceTodoListDataResult>) =>
        useWorkspaceTodoListDataSpy.mockReturnValue({
            todoList: [],
            state: 'idle',
            emptyState: {
                heading: 'empty-state',
                objectIllustration: { object: 'SUCCESS' },
            },
            errorState: {
                heading: 'error-state',
                objectIllustration: { object: 'ERROR' },
            },
            ...result,
        });

    beforeEach(() => {
        mockListData();
    });

    afterEach(() => {
        useWorkspaceTodoListDataSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWorkspaceTodoListProps>) => {
        const completeProps: IWorkspaceTodoListProps = {
            accounts: [account],
            workspaceId: 'test-workspace',
            pageSize: 3,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTodoList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('reads the to-dos of the accounts, loading while they resolve', () => {
        render(createTestComponent({ isPending: true }));

        expect(useWorkspaceTodoListDataSpy).toHaveBeenCalledWith({
            accounts: [account],
            isPending: true,
        });
    });

    it('renders no row and no state while loading', () => {
        mockListData({
            todoList: [buildProposalTodo('p1')],
            state: 'initialLoading',
        });
        render(createTestComponent());

        expect(screen.queryByText(/todo-row/)).not.toBeInTheDocument();
        expect(screen.queryByText('empty-state')).not.toBeInTheDocument();
    });

    it('renders the error state when the read fails', () => {
        mockListData({ state: 'error' });
        render(createTestComponent());

        expect(screen.getByText('error-state')).toBeInTheDocument();
    });

    it('renders the empty state when the list holds no to-do', () => {
        render(createTestComponent());

        expect(screen.getByText('empty-state')).toBeInTheDocument();
    });

    it('renders one row per to-do, in the order they are read', () => {
        mockListData({ todoList: [buildProposalTodo('p1'), transactionTodo] });
        render(createTestComponent());

        const rows = screen.getAllByText(/todo-row/);
        expect(rows.map((row) => row.textContent)).toEqual([
            `todo-row ${WorkspaceTodoType.PROPOSAL} test-workspace`,
            `todo-row ${WorkspaceTodoType.TRANSACTION} test-workspace`,
        ]);
    });

    it('displays one page of to-dos, the rest being a click away', async () => {
        mockListData({
            todoList: ['p1', 'p2', 'p3', 'p4'].map(buildProposalTodo),
        });
        render(createTestComponent({ pageSize: 3 }));

        expect(screen.getAllByText(/todo-row/)).toHaveLength(3);

        await userEvent.click(screen.getByRole('button'));
        expect(screen.getAllByText(/todo-row/)).toHaveLength(4);
    });

    it('warns when the list is missing to-dos', () => {
        mockListData({ partialMessage: 'partial-warning' });
        render(createTestComponent());

        expect(screen.getByText('partial-warning')).toBeInTheDocument();
    });
});
