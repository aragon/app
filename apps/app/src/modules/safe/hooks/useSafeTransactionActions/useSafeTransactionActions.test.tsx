import Safe, {
    EthSafeSignature,
    type EthSafeTransaction,
} from '@safe-global/protocol-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { type Hex, pad, toEventSelector } from 'viem';
import * as WagmiActions from 'wagmi/actions';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    generateSafeConfirmation,
    generateSafeNextNonceResponse,
    generateSafeQueueResponse,
    generateSafeTransaction,
} from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { safeTransactionEnvelopeUtils } from '../../utils/safeTransactionEnvelopeUtils';
import { useSafeTransactionActions } from './useSafeTransactionActions';

jest.mock('wagmi/actions', () => ({
    ...jest.requireActual('wagmi/actions'),
    getConnection: jest.fn(),
    sendTransaction: jest.fn(),
    waitForTransactionReceipt: jest.fn(),
}));

describe('useSafeTransactionActions hook', () => {
    const owner = `0x${'11'.repeat(20)}` as Hex;
    const secondOwner = `0x${'22'.repeat(20)}` as Hex;
    const safeAddress = `0x${'55'.repeat(20)}` as Hex;
    const chainId = 11_155_111;
    const outerHash = `0x${'ab'.repeat(32)}` as Hex;
    const signature = `0x${'99'.repeat(65)}`;
    const transaction = generateSafeTransaction({
        nonce: '7',
        to: owner,
        data: '0x',
        confirmations: [generateSafeConfirmation({ owner, signature })],
    });

    const hashOf = (
        fields: Omit<Partial<ISafeMultisigTransaction>, 'nonce'> & {
            nonce: string | number | bigint;
        },
    ) =>
        safeTransactionEnvelopeUtils.verifyTransactionHash({
            transaction: {
                ...transaction,
                ...fields,
                nonce: String(fields.nonce),
            },
            safeAddress,
            safeVersion: '1.4.1',
            chainId: BigInt(chainId),
        }).computedHash as string;

    transaction.safeTxHash = hashOf({ nonce: transaction.nonce });
    const getQueue = jest.spyOn(
        safeServiceApi.safeService,
        'getSafePendingTransactions',
    );
    const getNonce = jest.spyOn(safeServiceApi.safeService, 'getSafeNextNonce');
    const getOwners = jest.fn();
    const getThreshold = jest.fn();
    const signTypedData = jest.fn();
    const confirmTransaction = jest.fn();
    const useWalletAccount = jest.spyOn(walletAccountApi, 'useWalletAccount');
    const init = jest.spyOn(Safe, 'init');
    const useConfirm = jest.spyOn(safeServiceApi, 'useConfirmSafeTransaction');
    const logError = jest.spyOn(monitoringUtils, 'logError');

    const renderActions = (queryClient = new QueryClient()) =>
        renderHook(
            () =>
                useSafeTransactionActions({
                    network: Network.ETHEREUM_SEPOLIA,
                    safeAddress,
                    chainId,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        );
    const receipt = (event: string, status = 'success') => ({
        status,
        logs: [
            {
                address: safeAddress,
                topics: [toEventSelector(event), transaction.safeTxHash],
                data: pad('0x00'),
            },
        ],
    });

    beforeEach(() => {
        useWalletAccount.mockReturnValue({
            address: owner,
            chainId,
            isConnecting: false,
            isReconnecting: false,
        });
        jest.mocked(WagmiActions.getConnection).mockReturnValue({
            accounts: [owner],
            chainId,
            connector: { getProvider: async () => ({ request: jest.fn() }) },
        } as never);
        getQueue.mockResolvedValue(
            generateSafeQueueResponse({ results: [transaction] }),
        );
        getNonce.mockResolvedValue(
            generateSafeNextNonceResponse({
                currentNonce: '7',
                nextNonce: '8',
            }),
        );
        getOwners.mockResolvedValue([owner, secondOwner]);
        getThreshold.mockResolvedValue(1);
        signTypedData.mockResolvedValue(new EthSafeSignature(owner, signature));
        confirmTransaction.mockResolvedValue(undefined);
        useConfirm.mockReturnValue({
            mutateAsync: confirmTransaction,
        } as never);
        init.mockResolvedValue({
            getOwners,
            getThreshold,
            signTypedData,
            getTransactionHash: async (tx: EthSafeTransaction) =>
                hashOf(tx.data),
            isValidTransaction: async () => true,
            getEncodedTransaction: async () => '0xdeadbeef',
        } as never);
        jest.mocked(WagmiActions.sendTransaction).mockResolvedValue(outerHash);
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            receipt('ExecutionSuccess(bytes32,uint256)') as never,
        );
        logError.mockImplementation(() => undefined);
    });
    afterEach(() => jest.clearAllMocks());

    it('uses confirmations collected after review to execute the reviewed hash', async () => {
        getThreshold.mockResolvedValue(2);
        getQueue.mockResolvedValue(
            generateSafeQueueResponse({
                results: [
                    {
                        ...transaction,
                        confirmations: [
                            ...transaction.confirmations,
                            generateSafeConfirmation({
                                owner: secondOwner,
                                signature,
                            }),
                        ],
                    },
                ],
            }),
        );
        const { result } = renderActions();
        await act(async () => {
            expect(await result.current.execute(transaction)).toEqual({
                status: 'executed',
                hash: outerHash,
            });
        });
        expect(WagmiActions.sendTransaction).toHaveBeenCalledTimes(1);
        expect(signTypedData).not.toHaveBeenCalled();
    });

    it.each([
        ['6', 'nonceQueued'],
        ['8', 'nonceConsumed'],
    ])(
        'refuses execution when the live nonce is %s',
        async (currentNonce, messageKey) => {
            getNonce.mockResolvedValue(
                generateSafeNextNonceResponse({ currentNonce }),
            );
            const { result } = renderActions();
            await act(async () => {
                expect(await result.current.execute(transaction)).toEqual({
                    status: 'error',
                    messageKey,
                });
            });
            expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
        },
    );

    it('does not sign a reviewed transaction after its nonce is consumed', async () => {
        getNonce.mockResolvedValue(
            generateSafeNextNonceResponse({ currentNonce: '8' }),
        );
        const { result } = renderActions();
        await act(() => result.current.confirm(transaction));
        expect(result.current.confirmError).toBe('nonceConsumed');
        expect(signTypedData).not.toHaveBeenCalled();
        expect(confirmTransaction).not.toHaveBeenCalled();
    });

    it('keeps a stored signature when refreshing the queue afterwards fails', async () => {
        // The service already holds the signature. Reporting the failed refresh as a failed
        // confirmation would ask the owner to sign again for nothing.
        const client = new QueryClient();
        jest.spyOn(client, 'invalidateQueries').mockRejectedValue(
            new Error('offline'),
        );
        const { result } = renderActions(client);
        await act(() => result.current.confirm(transaction));
        expect(confirmTransaction).toHaveBeenCalled();
        expect(result.current.confirmError).toBeUndefined();
    });

    it('does not sign against a queue the service served from a stale cache', async () => {
        getQueue.mockResolvedValue(
            generateSafeQueueResponse({
                results: [transaction],
                meta: { source: 'cache', fetchedAt: '', stale: true },
            }),
        );
        const { result } = renderActions();
        await act(() => result.current.confirm(transaction));
        expect(result.current.confirmError).toBe('stale');
        expect(signTypedData).not.toHaveBeenCalled();
    });

    it('rejects a substituted envelope even if the service preserves its claimed hash', async () => {
        const changed = { ...transaction, value: '1' };
        getQueue.mockResolvedValue(
            generateSafeQueueResponse({ results: [changed] }),
        );
        const { result } = renderActions();
        await act(async () => {
            expect(await result.current.execute(changed)).toMatchObject({
                status: 'error',
            });
        });
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
        expect(signTypedData).not.toHaveBeenCalled();
    });

    it('refuses a disconnected review closure after the connected account changes to a non-owner', async () => {
        const { result, rerender } = renderActions();
        const reviewedAction = result.current.execute;
        useWalletAccount.mockReturnValue({
            address: `0x${'33'.repeat(20)}`,
            chainId,
            isConnecting: false,
            isReconnecting: false,
        });
        rerender();
        await act(async () => {
            expect(await reviewedAction(transaction)).toEqual({
                status: 'error',
                messageKey: 'notOwner',
            });
        });
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it.each([
        ['ExecutionSuccess(bytes32,uint256)', 'reverted', 'reverted'],
        ['ExecutionFailure(bytes32,uint256)', 'success', 'innerFailed'],
        ['Unrelated(bytes32,uint256)', 'success', 'unconfirmed'],
    ])(
        'keeps the receipt outcome for %s with outer status %s',
        async (event, status, messageKey) => {
            jest.mocked(
                WagmiActions.waitForTransactionReceipt,
            ).mockResolvedValue(receipt(event, status) as never);
            const { result } = renderActions();
            await act(async () => {
                expect(await result.current.execute(transaction)).toEqual({
                    status: 'error',
                    messageKey,
                    hash: outerHash,
                });
            });
        },
    );

    it('keeps an accepted confirmation when later execution loses authority', async () => {
        const { result } = renderActions();
        await act(() => result.current.confirm(transaction));
        expect(confirmTransaction).toHaveBeenCalledTimes(1);
        getThreshold.mockResolvedValue(2);
        await act(async () => {
            expect(await result.current.execute(transaction)).toEqual({
                status: 'error',
                messageKey: 'authorityChanged',
            });
        });
        expect(result.current.confirmError).toBeUndefined();
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('keeps the execution receipt when refreshing account data fails', async () => {
        const client = new QueryClient();
        jest.spyOn(client, 'invalidateQueries').mockRejectedValue(
            new Error('offline'),
        );
        const { result } = renderActions(client);
        await act(async () => {
            expect(await result.current.execute(transaction)).toEqual({
                status: 'executed',
                hash: outerHash,
            });
        });
        expect(result.current.isExecuting).toBe(false);
    });
});
