import { renderHook, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { Network } from '@/shared/api/daoService';
import { safeService } from '@/shared/api/safeService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { generateSafeMultisigTransaction } from '../../testUtils';
import { safeMultisigTransactionUtils } from '../../utils/safeMultisigTransactionUtils';
import { useSafeSettledReport } from './useSafeSettledReport';

describe('useSafeSettledReport hook', () => {
    const safe = '0x0000000000000000000000000000000000000001';
    const plugin = '0x0000000000000000000000000000000000000002';
    const proposalId = BigInt(42);
    const stageId = 1;

    const historySpy = jest.spyOn(safeService, 'getSafeTransactionHistory');

    afterEach(() => {
        historySpy.mockReset();
    });

    const reportTransaction = (nonce: string, executionDate?: string) =>
        generateSafeMultisigTransaction({
            nonce,
            to: plugin,
            isExecuted: true,
            executionDate,
            data: safeMultisigTransactionUtils.buildReportProposalResultData({
                proposalId,
                stageId,
                resultType: SppProposalType.APPROVAL,
            }),
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

    const renderScan = (notBefore?: DateTime) =>
        renderHook(
            () =>
                useSafeSettledReport({
                    network: Network.ETHEREUM_SEPOLIA,
                    address: safe,
                    pluginAddress: plugin,
                    proposalId,
                    stageId,
                    notBefore,
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
        expect(historySpy).toHaveBeenCalledTimes(2);
    });

    it('stops scanning once a page predates the stage', async () => {
        // Safe executes in strict nonce order, so execution dates fall as the scan walks back: past
        // the stage start the report cannot be further behind.
        const stageStart = DateTime.fromISO('2026-09-01T00:00:00Z');
        historySpy.mockResolvedValue(
            page(
                [
                    generateSafeMultisigTransaction({
                        nonce: '9',
                        executionDate: '2026-08-01T00:00:00Z',
                    }),
                ],
                'next',
            ),
        );

        const { result } = renderScan(stageStart);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        expect(result.current.settledReport).toBeUndefined();
        expect(result.current.isError).toBe(false);
        expect(historySpy).toHaveBeenCalledTimes(1);
    });

    it('reports a miss as an answer rather than an error', async () => {
        historySpy.mockResolvedValue(
            page([generateSafeMultisigTransaction({ nonce: '9' })], null),
        );

        const { result } = renderScan();

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        expect(result.current.settledReport).toBeUndefined();
        expect(result.current.isError).toBe(false);
    });
});
