import { renderHook, waitFor } from '@testing-library/react';
import {
    concatHex,
    encodeFunctionData,
    encodePacked,
    type Hex,
    size,
} from 'viem';
import {
    safeMultiSendAbi,
    safeMultiSendSelector,
} from '@/modules/safe/utils/safeTransactionEnvelopeUtils';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { Network } from '@/shared/api/daoService';
import { safeService } from '@/shared/api/safeService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { settledHistoryMaxPages } from '../../constants';
import { generateSafeMultisigTransaction } from '../../testUtils';
import { safeMultisigTransactionUtils } from '../../utils/safeMultisigTransactionUtils';
import { useSafeSettledReport } from './useSafeSettledReport';
import { SafeSettledReportOutcome } from './useSafeSettledReport.api';

describe('useSafeSettledReport hook', () => {
    const safe = '0x0000000000000000000000000000000000000001';
    const plugin = '0x0000000000000000000000000000000000000002';
    const multiSend = '0x0000000000000000000000000000000000000003';
    const proposalId = BigInt(42);
    const stageId = 1;

    const historySpy = jest.spyOn(safeService, 'getSafeTransactionHistory');

    afterEach(() => {
        historySpy.mockReset();
    });

    const reportData = (resultType = SppProposalType.APPROVAL) =>
        safeMultisigTransactionUtils.buildReportProposalResultData({
            proposalId,
            stageId,
            resultType,
        });

    const reportTransaction = (
        nonce: string,
        overrides?: Partial<ReturnType<typeof generateSafeMultisigTransaction>>,
    ) =>
        generateSafeMultisigTransaction({
            nonce,
            to: plugin,
            isExecuted: true,
            isSuccessful: true,
            data: reportData(),
            ...overrides,
        });

    const page = (
        results: ReturnType<typeof generateSafeMultisigTransaction>[],
        next: string | null,
    ) =>
        ({
            count: results.length,
            next,
            previous: null,
            results,
            meta: { source: 'safe-api', fetchedAt: '', stale: false },
        }) as never;

    const renderScan = (resultType = SppProposalType.APPROVAL) =>
        renderHook(
            () =>
                useSafeSettledReport({
                    network: Network.ETHEREUM_SEPOLIA,
                    address: safe,
                    pluginAddress: plugin,
                    proposalId,
                    stageId,
                    resultType,
                    enabled: true,
                }),
            { wrapper: ReactQueryWrapper },
        );

    it('walks past pages of unrelated executions to find the report', async () => {
        // A treasury keeps executing after a report, so the target is not on the first page. `to`
        // cannot narrow the read: a MultiSend batch targets the MultiSend contract, not the plugin.
        historySpy
            .mockResolvedValueOnce(
                page([generateSafeMultisigTransaction({ nonce: '9' })], 'next'),
            )
            .mockResolvedValueOnce(page([reportTransaction('4')], null));

        const { result } = renderScan();

        await waitFor(() => {
            expect(result.current.settledReport?.transaction.nonce).toEqual(
                '4',
            );
        });
        expect(result.current.outcome).toEqual(SafeSettledReportOutcome.FOUND);
        expect(historySpy).toHaveBeenCalledTimes(2);
    });

    it('keeps scanning past executions older than the stage, which can still carry the report', async () => {
        // `reportProposalResult` rejects only a future stage, so a report can execute before the
        // stage's start date. A date floor here would abandon real evidence one page short of it.
        historySpy
            .mockResolvedValueOnce(
                page(
                    [
                        generateSafeMultisigTransaction({
                            nonce: '9',
                            executionDate: '2020-01-01T00:00:00Z',
                        }),
                    ],
                    'next',
                ),
            )
            .mockResolvedValueOnce(
                page(
                    [
                        reportTransaction('4', {
                            executionDate: '2019-01-01T00:00:00Z',
                        }),
                    ],
                    null,
                ),
            );

        const { result } = renderScan();

        await waitFor(() => {
            expect(result.current.settledReport?.transaction.nonce).toEqual(
                '4',
            );
        });
    });

    it('separates a fully walked history from a budget that ran out', async () => {
        historySpy.mockResolvedValue(
            page([generateSafeMultisigTransaction({ nonce: '9' })], null),
        );

        const { result: walked } = renderScan();

        await waitFor(() => {
            expect(walked.current.outcome).toEqual(
                SafeSettledReportOutcome.NOT_REPORTED,
            );
        });
        expect(walked.current.settledReport).toBeUndefined();
        expect(walked.current.isError).toBe(false);

        historySpy.mockReset();
        historySpy.mockResolvedValue(
            page([generateSafeMultisigTransaction({ nonce: '9' })], 'next'),
        );

        const { result: exhausted } = renderScan(SppProposalType.VETO);

        await waitFor(() => {
            expect(exhausted.current.outcome).toEqual(
                SafeSettledReportOutcome.SCAN_EXHAUSTED,
            );
        });
        expect(exhausted.current.settledReport).toBeUndefined();
        expect(historySpy).toHaveBeenCalledTimes(settledHistoryMaxPages);
    });

    it('stops on an empty page instead of refetching it to the budget', async () => {
        // A page with no results cannot advance the offset, so without a guard the scan would
        // refetch the same page ten times and blame the budget for a walked-out history.
        historySpy.mockResolvedValue(page([], 'next'));

        const { result } = renderScan();

        await waitFor(() => {
            expect(result.current.outcome).toEqual(
                SafeSettledReportOutcome.NOT_REPORTED,
            );
        });
        expect(historySpy).toHaveBeenCalledTimes(1);
    });

    it('skips a report whose execution failed in favour of one that took effect', async () => {
        // History serves executed transactions, and executed is not successful: one that emitted
        // `ExecutionFailure` consumed its nonce and reported nothing.
        historySpy.mockResolvedValue(
            page(
                [
                    reportTransaction('9', { isSuccessful: false }),
                    reportTransaction('4'),
                ],
                null,
            ),
        );

        const { result } = renderScan();

        await waitFor(() => {
            expect(result.current.settledReport?.transaction.nonce).toEqual(
                '4',
            );
        });
    });

    it('accepts a report the service does not classify', async () => {
        historySpy.mockResolvedValue(
            page([reportTransaction('9', { isSuccessful: null })], null),
        );

        const { result } = renderScan();

        await waitFor(() => {
            expect(result.current.settledReport?.transaction.nonce).toEqual(
                '9',
            );
        });
    });

    it('skips a report that carried the opposite verdict', async () => {
        // A body that approved and later vetoed has two correlating transactions. Only the one
        // reporting the recorded verdict explains it.
        historySpy.mockResolvedValue(
            page(
                [
                    reportTransaction('9', {
                        data: reportData(SppProposalType.VETO),
                    }),
                    reportTransaction('4'),
                ],
                null,
            ),
        );

        const { result } = renderScan(SppProposalType.APPROVAL);

        await waitFor(() => {
            expect(result.current.settledReport?.transaction.nonce).toEqual(
                '4',
            );
        });
    });

    it('finds a report nested in a batch', async () => {
        const packed = encodePacked(
            ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
            [
                0,
                plugin as Hex,
                BigInt(0),
                BigInt(size(reportData())),
                reportData(),
            ],
        );
        const batchData = encodeFunctionData({
            abi: safeMultiSendAbi,
            functionName: 'multiSend',
            args: [concatHex([packed])],
        });

        historySpy.mockResolvedValue(
            page(
                [
                    reportTransaction('9', {
                        to: multiSend,
                        operation: 1,
                        data: batchData,
                    }),
                ],
                null,
            ),
        );

        const { result } = renderScan();

        await waitFor(() => {
            expect(result.current.settledReport?.report.resultType).toEqual(
                SppProposalType.APPROVAL,
            );
        });
        expect(batchData.startsWith(safeMultiSendSelector)).toBe(true);
    });
});
