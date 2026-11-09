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
    type IWorkspaceTodoContentProps,
    WorkspaceTodoContent,
    WorkspaceTodoFilter,
} from './workspaceTodoContent';
import type { IWorkspaceTodoProposalItemProps } from './workspaceTodoProposalItem';
import type { IWorkspaceTodoSafeTransactionItemProps } from './workspaceTodoSafeTransactionItem';

// The rows are tested on their own; here they only need to say which row renders for what.
jest.mock('./workspaceTodoProposalItem', () => ({
    WorkspaceTodoProposalItem: (props: IWorkspaceTodoProposalItemProps) => (
        <p>{`proposal-row ${props.proposal.id}`}</p>
    ),
}));

jest.mock('./workspaceTodoSafeTransactionItem', () => ({
    WorkspaceTodoSafeTransactionItem: (
        props: IWorkspaceTodoSafeTransactionItemProps,
    ) => <p>{`transaction-row ${props.transaction.safeTxHash}`}</p>,
}));

describe('<WorkspaceTodoContent /> component', () => {
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

    const buildProposalItem = (id: string) => ({
        proposal: { ...generateProposal({ id }), voteEndDate: 1_800_000_000 },
        dao: generateDao(),
    });
    const transactionItem = {
        account,
        safeInfo: generateSafeInfo(),
        transaction: generateSafeTransaction({ safeTxHash: '0xTx' }),
        hasNonceRival: false,
    };

    const mockTodo = (
        result?: Partial<
            ReturnType<typeof useWorkspaceTodoDataModule.useWorkspaceTodoData>
        >,
    ) =>
        useWorkspaceTodoDataSpy.mockReturnValue({
            proposals: [],
            transactions: [],
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

    const createTestComponent = (
        props?: Partial<IWorkspaceTodoContentProps>,
    ) => {
        const completeProps: IWorkspaceTodoContentProps = {
            accounts: [account],
            workspaceId: 'test-workspace',
            workspaceName: 'My Workspace',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTodoContent {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('asks to connect a wallet without one and opens the connect dialog', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        mockWallet(undefined);
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodoList\.connect\.heading$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /workspaceTodoList\.connect\.description \(workspace=My Workspace\)/,
            ),
        ).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceTodoList\.connect\.action$/,
            }),
        );
        expect(open).toHaveBeenCalledWith(ApplicationDialogId.CONNECT_WALLET);
        expect(useWorkspaceTodoDataSpy).toHaveBeenCalledWith({
            accounts: [account],
            address: undefined,
        });
    });

    it('renders no row and no state while the read or the accounts are pending', () => {
        mockTodo({ proposals: [buildProposalItem('p1')] });
        render(createTestComponent({ isAccountsPending: true }));

        expect(screen.queryByText(/proposal-row/)).not.toBeInTheDocument();
        expect(
            screen.queryByText(/workspaceTodoList\.emptyState\.heading$/),
        ).not.toBeInTheDocument();
    });

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

    it('lists the proposals before the Safe transactions as one list', () => {
        mockTodo({
            proposals: [buildProposalItem('p1')],
            transactions: [transactionItem],
        });
        render(createTestComponent());

        const proposalRow = screen.getByText('proposal-row p1');
        const transactionRow = screen.getByText('transaction-row 0xTx');
        expect(
            proposalRow.compareDocumentPosition(transactionRow) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(
            screen.queryByRole('link', { name: /workspaceTodoList\.viewAll$/ }),
        ).not.toBeInTheDocument();
    });

    it('keeps the rows of the selected kind only', () => {
        mockTodo({
            proposals: [buildProposalItem('p1')],
            transactions: [transactionItem],
        });
        render(
            createTestComponent({ filter: WorkspaceTodoFilter.TRANSACTIONS }),
        );

        expect(screen.queryByText(/proposal-row/)).not.toBeInTheDocument();
        expect(screen.getByText('transaction-row 0xTx')).toBeInTheDocument();
    });

    it('previews the first rows and links the rest to the view-all page', () => {
        mockTodo({
            proposals: ['p1', 'p2', 'p3', 'p4'].map(buildProposalItem),
        });
        render(createTestComponent({ previewSize: 3, viewAllHref: '/todos' }));

        expect(screen.getAllByText(/proposal-row/)).toHaveLength(3);
        expect(
            screen.getByRole('link', { name: /workspaceTodoList\.viewAll$/ }),
        ).toHaveAttribute('href', '/todos');
    });

    it('warns when a Safe could not be read', () => {
        mockTodo({ hasUnreadableAccounts: true });
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodoList\.partial$/),
        ).toBeInTheDocument();
    });
});
