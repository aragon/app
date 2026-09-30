import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { encodeFunctionData, type Hex } from 'viem';
import { Network } from '@/shared/api/daoService';
import { safeService } from '@/shared/api/safeService';
import {
    generateSafeInfoResponse,
    generateSafeQueueResponse,
    generateSafeTransaction,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { globalExecutorAbi } from '@/shared/utils/transactionUtils/globalExecutorAbi';
import { useSafeDaoProposals } from './useSafeDaoProposals';

const safeAddress = '0xd84C233A7D1578021d21E39785439bEdDB165F3D';
const daoAddress = '0x1111111111111111111111111111111111111111';
const otherDaoAddress = '0x2222222222222222222222222222222222222222';
const action = {
    to: '0x3333333333333333333333333333333333333333' as Hex,
    value: BigInt(0),
    data: '0x12345678' as Hex,
};

const buildExecute = (): Hex =>
    encodeFunctionData({
        abi: globalExecutorAbi,
        functionName: 'execute',
        args: [
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            [action],
            BigInt(0),
        ],
    });

const params = {
    network: Network.ETHEREUM_MAINNET,
    safeAddress,
    daoAddress,
};

describe('useSafeDaoProposals', () => {
    const getSafeInfoSpy = jest.spyOn(safeService, 'getSafeInfo');
    const getPendingSpy = jest.spyOn(safeService, 'getSafePendingTransactions');
    const getHistorySpy = jest.spyOn(safeService, 'getSafeTransactionHistory');
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const testWrapper = ({ children }: { children?: ReactNode }) =>
        createElement(ReactQueryWrapper, { client: queryClient, children });

    beforeEach(() => {
        queryClient.clear();
        getSafeInfoSpy.mockResolvedValue(generateSafeInfoResponse());
        getPendingSpy.mockResolvedValue(generateSafeQueueResponse());
        getHistorySpy.mockResolvedValue(generateSafeQueueResponse());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('reads a DAO proposal from a later queue page', async () => {
        const firstPage = generateSafeQueueResponse({
            count: 2,
            next: 'https://untrusted.example/next',
            results: [generateSafeTransaction({ safeTxHash: '0xother' })],
        });
        const secondPage = generateSafeQueueResponse({
            count: 2,
            results: [
                generateSafeTransaction({
                    safeTxHash: '0xlater',
                    to: daoAddress,
                    data: buildExecute(),
                }),
            ],
        });
        getPendingSpy.mockImplementation(async ({ queryParams }) =>
            queryParams?.offset === 0 ? firstPage : secondPage,
        );

        const { result } = renderHook(() => useSafeDaoProposals(params), {
            wrapper: testWrapper,
        });

        await waitFor(() =>
            expect(result.current.data?.proposals).toHaveLength(1),
        );
        expect(result.current.data?.proposals[0]?.transaction.safeTxHash).toBe(
            '0xlater',
        );
        expect(
            getPendingSpy.mock.calls.map(
                ([request]) => request.queryParams?.offset,
            ),
        ).toEqual([0, 1]);
    });

    it('keeps same-Safe feeds separate for different DAO addresses', async () => {
        const firstDaoTransaction = generateSafeTransaction({
            safeTxHash: '0xdao-one',
            to: daoAddress,
            data: buildExecute(),
        });
        const secondDaoTransaction = generateSafeTransaction({
            safeTxHash: '0xdao-two',
            to: otherDaoAddress,
            data: buildExecute(),
        });
        getPendingSpy.mockResolvedValue(
            generateSafeQueueResponse({
                results: [firstDaoTransaction, secondDaoTransaction],
            }),
        );

        const { result: firstResult } = renderHook(
            () => useSafeDaoProposals(params),
            { wrapper: testWrapper },
        );
        await waitFor(() =>
            expect(firstResult.current.data?.proposals).toHaveLength(1),
        );

        const { result: secondResult } = renderHook(
            () =>
                useSafeDaoProposals({
                    ...params,
                    daoAddress: otherDaoAddress,
                }),
            { wrapper: testWrapper },
        );
        await waitFor(() =>
            expect(secondResult.current.data?.proposals).toHaveLength(1),
        );

        expect(
            firstResult.current.data?.proposals[0]?.transaction.safeTxHash,
        ).toBe('0xdao-one');
        expect(
            secondResult.current.data?.proposals[0]?.transaction.safeTxHash,
        ).toBe('0xdao-two');
    });

    it('lets the executed history row replace a queued row with the same hash', async () => {
        const hash = '0xsame-hash';
        getPendingSpy.mockResolvedValue(
            generateSafeQueueResponse({
                results: [
                    generateSafeTransaction({
                        safeTxHash: hash,
                        to: daoAddress,
                        data: buildExecute(),
                        isExecuted: false,
                    }),
                ],
            }),
        );
        getHistorySpy.mockResolvedValue(
            generateSafeQueueResponse({
                results: [
                    generateSafeTransaction({
                        safeTxHash: hash,
                        to: daoAddress,
                        data: buildExecute(),
                        isExecuted: true,
                        isSuccessful: true,
                    }),
                ],
            }),
        );

        const { result } = renderHook(() => useSafeDaoProposals(params), {
            wrapper: testWrapper,
        });

        await waitFor(() =>
            expect(result.current.data?.proposals).toHaveLength(1),
        );
        expect(result.current.data?.proposals[0]?.transaction.isExecuted).toBe(
            true,
        );
        expect(
            result.current.data?.proposals[0]?.transaction.isSuccessful,
        ).toBe(true);
    });

    it('surfaces Safe read failures instead of returning an empty feed', async () => {
        const failure = new Error('Safe read failed');
        getPendingSpy.mockRejectedValue(failure);

        const { result } = renderHook(() => useSafeDaoProposals(params), {
            wrapper: testWrapper,
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBe(failure);
    });

    it('marks an incomplete page response as partial while preserving rows', async () => {
        getPendingSpy.mockResolvedValue(
            generateSafeQueueResponse({
                count: 2,
                results: [
                    generateSafeTransaction({
                        safeTxHash: '0xpartial',
                        to: daoAddress,
                        data: buildExecute(),
                    }),
                ],
            }),
        );

        const { result } = renderHook(() => useSafeDaoProposals(params), {
            wrapper: testWrapper,
        });

        await waitFor(() =>
            expect(result.current.data?.meta.partial).toBe(true),
        );
        expect(result.current.data?.proposals).toHaveLength(1);
        expect(result.current.isPartial).toBe(true);
    });
});
