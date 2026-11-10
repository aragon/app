import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
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
    type IWorkspaceTodoPreviewProps,
    WorkspaceTodoPreview,
} from './workspaceTodoPreview';
import type { IWorkspaceTodoPreviewItemProps } from './workspaceTodoPreviewItem';

// The row is tested on its own; here it only needs to say which to-do it renders.
jest.mock('./workspaceTodoPreviewItem', () => ({
    WorkspaceTodoPreviewItem: (props: IWorkspaceTodoPreviewItemProps) => (
        <p>{`todo-row ${props.todo.type} ${props.workspaceId}`}</p>
    ),
    WorkspaceTodoPreviewItemSkeleton: () => <p>todo-skeleton</p>,
}));

describe('<WorkspaceTodoPreview /> component', () => {
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

    const createTestComponent = (
        props?: Partial<IWorkspaceTodoPreviewProps>,
    ) => {
        const completeProps: IWorkspaceTodoPreviewProps = {
            accounts: [account],
            workspaceId: 'test-workspace',
            previewSize: 3,
            viewAllHref: '/todos',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTodoPreview {...completeProps} />
            </GukModulesProvider>
        );
    };

    const queryViewAll = () =>
        screen.queryByRole('link', { name: /workspaceTodoPreview\.viewAll$/ });

    it('reads the to-dos of the accounts', () => {
        render(createTestComponent());

        expect(useWorkspaceTodoListDataSpy).toHaveBeenCalledWith({
            accounts: [account],
        });
    });

    it('renders placeholders instead of rows and states while loading', () => {
        mockListData({
            todoList: [buildProposalTodo('p1')],
            state: 'initialLoading',
        });
        render(createTestComponent());

        expect(screen.getAllByText('todo-skeleton').length).toBeGreaterThan(0);
        expect(screen.queryByText(/todo-row/)).not.toBeInTheDocument();
        expect(screen.queryByText('empty-state')).not.toBeInTheDocument();
    });

    it('renders the error state when the read fails', () => {
        mockListData({ state: 'error' });
        render(createTestComponent());

        expect(screen.getByText('error-state')).toBeInTheDocument();
        expect(screen.queryByText('empty-state')).not.toBeInTheDocument();
    });

    it('renders the empty state when there is no to-do', () => {
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
        expect(queryViewAll()).not.toBeInTheDocument();
    });

    it('previews the first to-dos and links the rest to the view-all page', () => {
        mockListData({
            todoList: ['p1', 'p2', 'p3', 'p4'].map(buildProposalTodo),
        });
        render(createTestComponent({ previewSize: 3, viewAllHref: '/todos' }));

        expect(screen.getAllByText(/todo-row/)).toHaveLength(3);
        expect(queryViewAll()).toHaveAttribute('href', '/todos');
    });

    it('warns when the preview is missing to-dos', () => {
        mockListData({ partialMessage: 'partial-warning' });
        render(createTestComponent());

        expect(screen.getByText('partial-warning')).toBeInTheDocument();
    });
});
