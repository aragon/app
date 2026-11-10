import { renderHook } from '@testing-library/react';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { generateProposal } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDao, generateDialogContext } from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import * as useWorkspaceTodoDataModule from '../useWorkspaceTodoData';
import {
    type IUseWorkspaceTodoDataResult,
    type IWorkspaceTodoItem,
    WorkspaceTodoType,
} from '../useWorkspaceTodoData';
import {
    type IUseWorkspaceTodoListDataParams,
    useWorkspaceTodoListData,
} from './useWorkspaceTodoListData';

describe('useWorkspaceTodoListData hook', () => {
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

    const todo: IWorkspaceTodoItem = {
        type: WorkspaceTodoType.PROPOSAL,
        proposal: { ...generateProposal(), voteEndDate: 1_800_000_000 },
        dao: generateDao(),
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

    const renderTodoListData = (
        params?: Partial<IUseWorkspaceTodoListDataParams>,
    ) =>
        renderHook(() =>
            useWorkspaceTodoListData({ accounts: [account], ...params }),
        );

    it('reads the to-dos of the connected wallet across the accounts', () => {
        mockTodo({ todos: [todo] });
        const { result } = renderTodoListData();

        expect(useWorkspaceTodoDataSpy).toHaveBeenCalledWith({
            accounts: [account],
            address: walletAddress,
        });
        expect(result.current.todoList).toEqual([todo]);
        expect(result.current.state).toBe('idle');
    });

    it('is idle and asks to connect a wallet without one', () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        mockWallet(undefined);
        // Nothing is read without a wallet, so nothing loads either, even while the accounts still resolve.
        const { result } = renderTodoListData({ isPending: true });

        expect(result.current.state).toBe('idle');
        expect(result.current.emptyState.heading).toMatch(
            /workspaceTodoList\.connect\.heading$/,
        );

        // The handler ignores the click event it is given.
        result.current.emptyState.primaryButton?.onClick?.({} as never);
        expect(open).toHaveBeenCalledWith(ApplicationDialogId.CONNECT_WALLET);
    });

    it('says that nothing is waiting for a connected wallet', () => {
        const { result } = renderTodoListData();

        expect(result.current.emptyState.heading).toMatch(
            /workspaceTodoList\.emptyState\.heading$/,
        );
        expect(result.current.emptyState.primaryButton).toBeUndefined();
    });

    it.each([
        ['the read is pending', { isPending: true }, undefined],
        ['the accounts are pending', undefined, { isPending: true }],
    ])('is loading while %s', (_what, todoResult, params) => {
        mockTodo(todoResult);
        const { result } = renderTodoListData(params);

        expect(result.current.state).toBe('initialLoading');
    });

    it('fails when the read fails', () => {
        mockTodo({ isError: true });
        const { result } = renderTodoListData();

        expect(result.current.state).toBe('error');
        expect(result.current.errorState.heading).toMatch(
            /workspaceTodoList\.errorState\.heading$/,
        );
    });

    it('warns only when a Safe could not be read', () => {
        expect(renderTodoListData().result.current.partialMessage).toBe(
            undefined,
        );

        mockTodo({ hasUnreadableAccounts: true });

        expect(renderTodoListData().result.current.partialMessage).toMatch(
            /workspaceTodoList\.partial$/,
        );
    });
});
