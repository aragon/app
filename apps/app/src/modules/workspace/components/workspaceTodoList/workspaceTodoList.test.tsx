import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { generateProposal } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDialogContext,
    generateSafeInfo,
    generateSafeTransaction,
} from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import * as useWorkspaceTodoDataModule from '../../hooks/useWorkspaceTodoData';
import {
    type IUseWorkspaceTodoDataResult,
    type IWorkspaceTodoItem,
    WorkspaceTodoType,
} from '../../hooks/useWorkspaceTodoData';
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
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    const useWorkspaceTodoDataSpy = jest.spyOn(
        useWorkspaceTodoDataModule,
        'useWorkspaceTodoData',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    const walletAddress = '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B';

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

    const mockTodo = (result?: Partial<IUseWorkspaceTodoDataResult>) =>
        useWorkspaceTodoDataSpy.mockReturnValue({
            todos: [],
            isPending: false,
            isError: false,
            hasUnreadableAccounts: false,
            ...result,
        });

    const mockWallet = (address?: string) =>
        useWalletAccountSpy.mockReturnValue({
            address,
        } as unknown as ReturnType<
            typeof useWalletAccountModule.useWalletAccount
        >);

    beforeEach(() => {
        mockWallet(walletAddress);
        mockTodo();
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useWorkspaceTodoDataSpy.mockReset();
        useDialogContextSpy.mockReset();
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

    it('reads the to-dos of the connected wallet across the accounts', () => {
        render(createTestComponent());

        expect(useWorkspaceTodoDataSpy).toHaveBeenCalledWith({
            accounts: [account],
            address: walletAddress,
        });
    });

    it('asks to connect a wallet without one and opens the connect dialog', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        mockWallet(undefined);
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodoList\.connect\.heading$/),
        ).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceTodoList\.connect\.action$/,
            }),
        );
        expect(open).toHaveBeenCalledWith(ApplicationDialogId.CONNECT_WALLET);
    });

    it.each([
        ['the read', { isPending: true }, undefined],
        ['the accounts', undefined, { isPending: true }],
    ])(
        'renders no row and no state while %s are pending',
        (_what, todoResult, props) => {
            mockTodo({ todos: [buildProposalTodo('p1')], ...todoResult });
            render(createTestComponent(props));

            expect(screen.queryByText(/todo-row/)).not.toBeInTheDocument();
            expect(
                screen.queryByText(/workspaceTodoList\.emptyState\.heading$/),
            ).not.toBeInTheDocument();
        },
    );

    it('renders the error state when the read fails', () => {
        mockTodo({ isError: true });
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodoList\.errorState\.heading$/),
        ).toBeInTheDocument();
    });

    it('renders the empty state when nothing is waiting for the wallet', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodoList\.emptyState\.heading$/),
        ).toBeInTheDocument();
    });

    it('renders one row per to-do, in the order they are read', () => {
        mockTodo({ todos: [buildProposalTodo('p1'), transactionTodo] });
        render(createTestComponent());

        const rows = screen.getAllByText(/todo-row/);
        expect(rows.map((row) => row.textContent)).toEqual([
            `todo-row ${WorkspaceTodoType.PROPOSAL} test-workspace`,
            `todo-row ${WorkspaceTodoType.TRANSACTION} test-workspace`,
        ]);
    });

    it('displays one page of to-dos, the rest being a click away', async () => {
        mockTodo({ todos: ['p1', 'p2', 'p3', 'p4'].map(buildProposalTodo) });
        render(createTestComponent({ pageSize: 3 }));

        expect(screen.getAllByText(/todo-row/)).toHaveLength(3);
        expect(
            screen.queryByRole('link', { name: /workspaceTodoList\.viewAll$/ }),
        ).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button'));
        expect(screen.getAllByText(/todo-row/)).toHaveLength(4);
    });

    it('previews one page and links the rest to the view-all page', () => {
        mockTodo({ todos: ['p1', 'p2', 'p3', 'p4'].map(buildProposalTodo) });
        render(createTestComponent({ pageSize: 3, viewAllHref: '/todos' }));

        expect(screen.getAllByText(/todo-row/)).toHaveLength(3);
        expect(
            screen.getByRole('link', { name: /workspaceTodoList\.viewAll$/ }),
        ).toHaveAttribute('href', '/todos');
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not link to the view-all page when the preview shows every to-do', () => {
        mockTodo({ todos: [buildProposalTodo('p1'), transactionTodo] });
        render(createTestComponent({ pageSize: 3, viewAllHref: '/todos' }));

        expect(
            screen.queryByRole('link', { name: /workspaceTodoList\.viewAll$/ }),
        ).not.toBeInTheDocument();
    });

    it('warns when a Safe could not be read', () => {
        mockTodo({ hasUnreadableAccounts: true });
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodoList\.partial$/),
        ).toBeInTheDocument();
    });
});
