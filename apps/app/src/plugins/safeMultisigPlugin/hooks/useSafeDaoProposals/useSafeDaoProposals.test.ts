import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { encodeFunctionData, type Hex } from 'viem';
import { Network } from '@/shared/api/daoService';
import {
    SafeStoredTransactionState,
    safeService,
} from '@/shared/api/safeService';
import {
    generateSafeInfoResponse,
    generateSafeQueueResponse,
    generateSafeTransaction,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { globalExecutorAbi } from '@/shared/utils/transactionUtils/globalExecutorAbi';
import { safeBodyPollInterval } from '../../constants';
import {
    rememberAcceptedSafeDaoProposal,
    useSafeDaoProposal,
    useSafeDaoProposals,
} from './useSafeDaoProposals';

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

const buildStoredResponse = (
    options?: Parameters<typeof generateSafeQueueResponse>[0],
    state: SafeStoredTransactionState = SafeStoredTransactionState.LIVE,
    metaOverrides: Partial<{
        fetchedAt: string | null;
        stale: boolean;
        partial: boolean;
    }> = {},
) => {
    const response = generateSafeQueueResponse(options);

    return {
        ...response,
        results: response.results.map((transaction) => ({
            ...transaction,
            state,
        })),
        meta: {
            source: 'store' as const,
            fetchedAt: '2025-01-01T00:00:00.000Z',
            stale: false,
            partial: false,
            ...metaOverrides,
        },
    };
};

const params = {
    network: Network.ETHEREUM_MAINNET,
    safeAddress,
    daoAddress,
};

describe('useSafeDaoProposals', () => {
    const getSafeInfoSpy = jest.spyOn(safeService, 'getSafeInfo');
    const getStoredSpy = jest.spyOn(safeService, 'getSafeStoredTransactions');
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const testWrapper = ({ children }: { children?: ReactNode }) =>
        createElement(ReactQueryWrapper, { client: queryClient, children });

    beforeEach(() => {
        queryClient.clear();
        getSafeInfoSpy.mockResolvedValue(generateSafeInfoResponse());
        getStoredSpy.mockResolvedValue(buildStoredResponse());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetches a later stored page only when requested', async () => {
        const firstPage = buildStoredResponse({
            count: 2,
            next: '1',
            results: [generateSafeTransaction({ safeTxHash: '0xother' })],
        });
        const secondPage = buildStoredResponse({
            count: 2,
            results: [
                generateSafeTransaction({
                    safeTxHash: '0xlater',
                    to: daoAddress,
                    data: buildExecute(),
                }),
            ],
        });
        getStoredSpy.mockImplementation(async ({ queryParams }) =>
            queryParams?.offset === 0 ? firstPage : secondPage,
        );

        const { result } = renderHook(() => useSafeDaoProposals(params), {
            wrapper: testWrapper,
        });

        await waitFor(() => expect(result.current.hasNextPage).toBe(true));
        expect(result.current.data?.proposals).toHaveLength(0);

        await act(async () => {
            await result.current.fetchNextPage();
        });

        await waitFor(() =>
            expect(result.current.data?.proposals).toHaveLength(1),
        );
        expect(result.current.data?.proposals[0]?.transaction.safeTxHash).toBe(
            '0xlater',
        );
        expect(
            getStoredSpy.mock.calls.map(
                ([request]) => request.queryParams?.offset,
            ),
        ).toEqual([0, '1']);
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
        getStoredSpy.mockResolvedValue(
            buildStoredResponse({
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

    it('maps an executed stored row to the executed proposal state', async () => {
        const hash = '0xsame-hash';
        getStoredSpy.mockResolvedValue(
            buildStoredResponse(
                {
                    results: [
                        generateSafeTransaction({
                            safeTxHash: hash,
                            to: daoAddress,
                            data: buildExecute(),
                            isExecuted: true,
                            isSuccessful: true,
                        }),
                    ],
                },
                SafeStoredTransactionState.EXECUTED,
            ),
        );

        const { result } = renderHook(() => useSafeDaoProposals(params), {
            wrapper: testWrapper,
        });

        await waitFor(() =>
            expect(result.current.data?.proposals).toHaveLength(1),
        );
        expect(result.current.data?.proposals[0]?.state).toBe('EXECUTED');
        expect(
            result.current.data?.proposals[0]?.transaction.isSuccessful,
        ).toBe(true);
    });

    it('surfaces stored read failures instead of returning an empty feed', async () => {
        const failure = new Error('Safe read failed');
        getStoredSpy.mockRejectedValue(failure);

        const { result } = renderHook(() => useSafeDaoProposals(params), {
            wrapper: testWrapper,
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBe(failure);
    });

    it('marks an incomplete stored response as partial while preserving rows', async () => {
        getStoredSpy.mockResolvedValue(
            buildStoredResponse(
                {
                    count: 2,
                    results: [
                        generateSafeTransaction({
                            safeTxHash: '0xpartial',
                            to: daoAddress,
                            data: buildExecute(),
                        }),
                    ],
                },
                SafeStoredTransactionState.LIVE,
                { partial: true },
            ),
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
    it('finds a hash in an explicit superseded state after a live miss', async () => {
        const hash = '0xsuperseded';
        const superseded = generateSafeTransaction({
            safeTxHash: hash,
            to: daoAddress,
            data: buildExecute(),
        });
        getStoredSpy.mockImplementation(async ({ queryParams }) =>
            queryParams?.state === SafeStoredTransactionState.SUPERSEDED
                ? buildStoredResponse(
                      { results: [superseded] },
                      SafeStoredTransactionState.SUPERSEDED,
                  )
                : buildStoredResponse({ results: [] }),
        );

        const { result } = renderHook(
            () => useSafeDaoProposal({ ...params, safeTxHash: hash }),
            { wrapper: testWrapper },
        );

        await waitFor(() =>
            expect(result.current.data?.proposals).toHaveLength(1),
        );
        expect(result.current.data?.proposals[0]?.state).toBe('SUPERSEDED');
        expect(
            getStoredSpy.mock.calls.map(
                ([request]) => request.queryParams?.state,
            ),
        ).toEqual([undefined, SafeStoredTransactionState.SUPERSEDED]);
    });

    it('resets exact lookup data when the DAO scope changes', async () => {
        const firstHash = '0xfirst-scope';
        const secondHash = '0xsecond-scope';
        getStoredSpy.mockImplementation(({ queryParams }) => {
            const to = queryParams?.to ?? daoAddress;
            const safeTxHash = to === daoAddress ? firstHash : secondHash;

            return Promise.resolve(
                buildStoredResponse({
                    results: [
                        generateSafeTransaction({
                            safeTxHash,
                            to,
                            data: buildExecute(),
                        }),
                    ],
                }),
            );
        });

        const { result, rerender } = renderHook(
            ({ daoAddress: scopedDaoAddress, safeTxHash }) =>
                useSafeDaoProposal({
                    ...params,
                    daoAddress: scopedDaoAddress,
                    safeTxHash,
                }),
            {
                initialProps: { daoAddress, safeTxHash: firstHash },
                wrapper: testWrapper,
            },
        );

        await waitFor(() =>
            expect(
                result.current.data?.proposals[0]?.transaction.safeTxHash,
            ).toBe(firstHash),
        );

        rerender({
            daoAddress: otherDaoAddress,
            safeTxHash: secondHash,
        });

        await waitFor(() =>
            expect(
                result.current.data?.proposals[0]?.transaction.safeTxHash,
            ).toBe(secondHash),
        );
    });

    it('polls an incomplete lookup until the stored index catches up', async () => {
        jest.useFakeTimers();
        const hash = '0xpolling';
        const target = generateSafeTransaction({
            safeTxHash: hash,
            to: daoAddress,
            data: buildExecute(),
        });
        let indexed = false;
        getStoredSpy.mockImplementation(() =>
            Promise.resolve(
                indexed
                    ? buildStoredResponse({ results: [target] })
                    : buildStoredResponse(
                          { results: [] },
                          SafeStoredTransactionState.LIVE,
                          { fetchedAt: null, partial: true },
                      ),
            ),
        );

        const { result } = renderHook(
            () => useSafeDaoProposal({ ...params, safeTxHash: hash }),
            { wrapper: testWrapper },
        );

        try {
            await act(() => jest.advanceTimersByTimeAsync(100));
            expect(result.current.isIndexing).toBe(true);
            indexed = true;

            await act(() =>
                jest.advanceTimersByTimeAsync(safeBodyPollInterval),
            );
            await waitFor(() =>
                expect(
                    result.current.data?.proposals[0]?.transaction.safeTxHash,
                ).toBe(hash),
            );
            expect(result.current.isIndexing).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it('keeps an accepted proposal visible while the stored index catches up', async () => {
        const hash = '0xaccepted-handoff';
        const transaction = generateSafeTransaction({
            safeTxHash: hash,
            to: daoAddress,
            data: buildExecute(),
        });
        rememberAcceptedSafeDaoProposal({
            ...params,
            transaction,
            owner: safeAddress,
            signature: `0x${'1'.repeat(130)}`,
        });

        const { result } = renderHook(
            () => useSafeDaoProposal({ ...params, safeTxHash: hash }),
            { wrapper: testWrapper },
        );

        await waitFor(() =>
            expect(
                result.current.data?.proposals[0]?.transaction.safeTxHash,
            ).toBe(hash),
        );
        expect(result.current.isIndexing).toBe(true);
        expect(result.current.isNotFound).toBe(false);
        expect(
            result.current.data?.proposals[0]?.transaction.confirmations,
        ).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    owner: safeAddress,
                    signature: `0x${'1'.repeat(130)}`,
                }),
            ]),
        );
    });

    it('reports not found for an unknown hash after a complete lookup', async () => {
        const { result } = renderHook(
            () =>
                useSafeDaoProposal({
                    ...params,
                    safeTxHash: '0xunknown-complete-lookup',
                }),
            { wrapper: testWrapper },
        );

        await waitFor(() => expect(result.current.isNotFound).toBe(true));
        expect(result.current.isIndexing).toBe(false);
    });

    it('reports a hard stored lookup error instead of indexing forever', async () => {
        const failure = new Error('Stored lookup failed');
        getStoredSpy.mockRejectedValue(failure);

        const { result } = renderHook(
            () =>
                useSafeDaoProposal({
                    ...params,
                    safeTxHash: '0xhard-error',
                }),
            { wrapper: testWrapper },
        );

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.isIndexing).toBe(false);
        expect(result.current.isNotFound).toBe(false);
        expect(result.current.error).toBe(failure);
    });
    it('does not canonicalize or request an empty Safe identity when disabled', () => {
        const disabledParams = {
            ...params,
            enabled: false,
            safeAddress: '',
        };
        const feed = renderHook(() => useSafeDaoProposals(disabledParams), {
            wrapper: testWrapper,
        });
        const detail = renderHook(
            () =>
                useSafeDaoProposal({
                    ...disabledParams,
                    safeTxHash: '',
                }),
            { wrapper: testWrapper },
        );

        expect(feed.result.current.isLoading).toBe(false);
        expect(detail.result.current.isLoading).toBe(false);
        expect(getSafeInfoSpy).not.toHaveBeenCalled();
        expect(getStoredSpy).not.toHaveBeenCalled();
    });
});
