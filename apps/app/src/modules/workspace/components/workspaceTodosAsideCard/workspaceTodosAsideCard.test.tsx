import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
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
import * as useWorkspaceTodoDataModule from '../../hooks/useWorkspaceTodoData';
import {
    type IUseWorkspaceTodoDataResult,
    type IWorkspaceTodoItem,
    WorkspaceTodoType,
} from '../../hooks/useWorkspaceTodoData';
import {
    type IWorkspaceTodosAsideCardProps,
    WorkspaceTodosAsideCard,
} from './workspaceTodosAsideCard';

describe('<WorkspaceTodosAsideCard /> component', () => {
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    const useWorkspaceTodoDataSpy = jest.spyOn(
        useWorkspaceTodoDataModule,
        'useWorkspaceTodoData',
    );

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
        transaction: generateSafeTransaction(),
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
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useWorkspaceTodoDataSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceTodosAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceTodosAsideCardProps = {
            accounts: [account],
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTodosAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders nothing without a connected wallet', () => {
        mockWallet(undefined);
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });

    it('reads the to-dos of the connected wallet across the accounts', () => {
        render(createTestComponent());

        expect(useWorkspaceTodoDataSpy).toHaveBeenCalledWith({
            accounts: [account],
            address: walletAddress,
        });
    });

    it('counts the proposals to vote on and the transactions to sign', () => {
        mockTodo({
            todos: [
                buildProposalTodo('p1'),
                buildProposalTodo('p2'),
                transactionTodo,
            ],
        });
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodosAsideCard\.proposals$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceTodosAsideCard\.transactions$/),
        ).toBeInTheDocument();
        // Two proposals and one transaction, so each count can only be the one of its kind.
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it.each([
        ['is pending', { isPending: true }],
        ['failed', { isError: true }],
    ])('counts nothing while the read %s', (_state, result) => {
        mockTodo(result);
        render(createTestComponent());

        expect(screen.getAllByText('-')).toHaveLength(2);
        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('is titled for every to-do by default and by the given title otherwise', () => {
        const { rerender } = render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodosAsideCard\.allTodos$/),
        ).toBeInTheDocument();

        rerender(createTestComponent({ title: 'Treasury Safe' }));

        expect(screen.getByText('Treasury Safe')).toBeInTheDocument();
    });
});
