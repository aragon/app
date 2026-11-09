import { ProposalStatus } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { generateProposal } from '@/modules/governance/testUtils';
import { daoService, Network } from '@/shared/api/daoService';
import {
    generateDao,
    generateSafeTransaction,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    type IWorkspaceTodoResponse,
    WorkspaceCoverageSource,
    WorkspaceCoverageStatus,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { useWorkspaceTodoData } from './useWorkspaceTodoData';

describe('useWorkspaceTodoData hook', () => {
    const network = Network.ETHEREUM_SEPOLIA;
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
    const walletAddress = '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B';

    const getTodoSpy = jest.spyOn(workspaceQueryService, 'getTodo');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const getSlotFunctionSpy = jest.spyOn(
        pluginRegistryUtils,
        'getSlotFunction',
    );

    const daoAccount: IWorkspaceAccount = {
        id: workspaceUtils.buildAccountId({ network, address: daoAddress }),
        type: WorkspaceAccountType.DAO,
        network,
        address: daoAddress,
    };
    const safeAccount: IWorkspaceAccount = {
        id: workspaceUtils.buildAccountId({ network, address: safeAddress }),
        type: WorkspaceAccountType.SAFE,
        network,
        address: safeAddress,
        metadata: { name: 'Treasury' },
    };
    const dao = generateDao({ id: daoAccount.id, name: 'Demo DAO' });

    const buildResponse = (
        response?: Partial<IWorkspaceTodoResponse>,
    ): IWorkspaceTodoResponse => ({
        proposals: [],
        transactions: [],
        coverage: [],
        partial: false,
        ...response,
    });

    beforeEach(() => {
        getTodoSpy.mockResolvedValue(buildResponse());
        getDaoSpy.mockResolvedValue(dao);
        getSlotFunctionSpy.mockReturnValue(() => ProposalStatus.ACTIVE);
    });

    afterEach(() => {
        getTodoSpy.mockReset();
        getDaoSpy.mockReset();
        getSlotFunctionSpy.mockReset();
    });

    const createWrapper = () => {
        // Retries are off so a failed read reports its error within the test's wait window.
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        const Wrapper = ({ children }: { children?: ReactNode }) => (
            <ReactQueryWrapper client={client}>{children}</ReactQueryWrapper>
        );

        return Wrapper;
    };

    const renderTodoData = (params?: {
        accounts?: IWorkspaceAccount[];
        address?: string;
    }) => {
        const { accounts = [daoAccount, safeAccount], address } = params ?? {
            address: walletAddress,
        };

        return renderHook(() => useWorkspaceTodoData({ accounts, address }), {
            wrapper: createWrapper(),
        });
    };

    it('reads nothing and is not pending without a connected wallet', () => {
        const { result } = renderTodoData({ accounts: [daoAccount] });

        expect(result.current).toEqual({
            proposals: [],
            transactions: [],
            isPending: false,
            isError: false,
            hasUnreadableAccounts: false,
        });
        expect(getTodoSpy).not.toHaveBeenCalled();
    });

    it('reads the to-do list of the wallet across every account', async () => {
        const { result } = renderTodoData();

        await waitFor(() => expect(result.current.isPending).toBeFalsy());
        expect(getTodoSpy).toHaveBeenCalledWith({
            body: {
                accounts: [
                    { network, address: daoAddress },
                    { network, address: safeAddress },
                ],
                memberAddress: walletAddress,
            },
        });
    });

    it('keeps the proposals the plugin calls active, with their DAO', async () => {
        const active = {
            ...generateProposal({ id: 'active', network, daoAddress }),
            voteEndDate: 1_800_000_000,
        };
        const approved = {
            ...generateProposal({ id: 'approved', network, daoAddress }),
            voteEndDate: 1_800_000_000,
        };
        getTodoSpy.mockResolvedValue(
            buildResponse({ proposals: [active, approved] }),
        );
        getSlotFunctionSpy.mockReturnValue((proposal: unknown) =>
            (proposal as { id: string }).id === 'active'
                ? ProposalStatus.ACTIVE
                : ProposalStatus.ACCEPTED,
        );

        const { result } = renderTodoData();

        await waitFor(() => expect(result.current.isPending).toBeFalsy());
        expect(result.current.proposals).toEqual([{ proposal: active, dao }]);
    });

    it('maps each transaction to its workspace account and keeps the Safe state', async () => {
        const transaction = generateSafeTransaction({ safeTxHash: '0xOne' });
        const safe = { nonce: '3', threshold: 2, version: '1.4.1' };
        getTodoSpy.mockResolvedValue(
            buildResponse({
                transactions: [
                    {
                        id: 'one',
                        account: {
                            network,
                            address: safeAddress.toLowerCase(),
                        },
                        safe,
                        hasNonceRival: true,
                        transaction,
                    },
                    {
                        id: 'unknown',
                        account: { network, address: '0xUnknown' },
                        safe: null,
                        hasNonceRival: false,
                        transaction: generateSafeTransaction(),
                    },
                ],
            }),
        );

        const { result } = renderTodoData();

        await waitFor(() => expect(result.current.isPending).toBeFalsy());
        expect(result.current.transactions).toEqual([
            {
                account: safeAccount,
                safeInfo: safe,
                transaction,
                hasNonceRival: true,
            },
        ]);
    });

    it('flags the unreadable accounts from the coverage', async () => {
        getTodoSpy.mockResolvedValue(
            buildResponse({
                coverage: [
                    {
                        account: { network, address: safeAddress },
                        resource: 'todo',
                        source: WorkspaceCoverageSource.SAFE,
                        status: WorkspaceCoverageStatus.UNAVAILABLE,
                    },
                ],
                partial: true,
            }),
        );

        const { result } = renderTodoData();

        await waitFor(() =>
            expect(result.current.hasUnreadableAccounts).toBeTruthy(),
        );
    });

    it('reports an error when the read fails', async () => {
        getTodoSpy.mockRejectedValue(new Error('unavailable'));

        const { result } = renderTodoData();

        await waitFor(() => expect(result.current.isError).toBeTruthy());
        expect(result.current.proposals).toEqual([]);
        expect(result.current.transactions).toEqual([]);
    });
});
