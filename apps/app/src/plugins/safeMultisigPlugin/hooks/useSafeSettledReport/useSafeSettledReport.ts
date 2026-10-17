'use client';

import { useQuery } from '@tanstack/react-query';
import {
    safeQueryGcTime,
    safeService,
    safeServiceKeys,
} from '@/shared/api/safeService';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import {
    settledHistoryMaxPages,
    settledHistoryPageSize,
} from '../../constants';
import { safeMultisigTransactionUtils } from '../../utils/safeMultisigTransactionUtils';
import {
    type IFindSettledReportParams,
    type ISafeSettledReportScan,
    type IUseSafeSettledReportParams,
    type IUseSafeSettledReportReturn,
    SafeSettledReportOutcome,
} from './useSafeSettledReport.api';

/**
 * How long a recovered report stays fresh. An executed transaction never changes, but which
 * transaction explains the current verdict does: while the stage is live a second report can
 * execute and overwrite it.
 */
const settledReportStaleTime = 5 * 60 * 1000;

/**
 * Scans a Safe's executed transactions backwards for the one that reported this body's verdict.
 *
 * Paged rather than a single read: history is ordered by descending nonce, and a treasury can
 * execute hundreds of unrelated transactions after the report, so the target is not reliably on the
 * first page. Filtering upstream is not an option - a report batched through MultiSend targets the
 * MultiSend contract, not the plugin, so `to` cannot narrow it and correlation has to decode.
 *
 * The scan is bounded by the page budget alone. It deliberately carries no date floor:
 * `reportProposalResult` rejects only a future stage and a nonexistent proposal (SPP v1.1.0), so a
 * report can legitimately execute before its stage's start date and a cutoff there would abandon
 * real evidence one page short of it.
 *
 * History order is the tie-break: the newest qualifying report is the one that wrote the verdict
 * standing today.
 */
// Misses are values, never `undefined`: TanStack Query rejects undefined data, which would turn
// "this report is not in the scanned window" into a query error.
const findSettledReport = async (
    params: IFindSettledReportParams,
): Promise<ISafeSettledReportScan> => {
    const { network, address, pluginAddress, proposalId, stageId, resultType } =
        params;

    let offset = 0;

    for (let page = 0; page < settledHistoryMaxPages; page++) {
        const response = await safeService.getSafeTransactionHistory({
            urlParams: { network, address },
            queryParams: { limit: settledHistoryPageSize, offset },
        });

        for (const transaction of response.results) {
            const report =
                safeMultisigTransactionUtils.findProposalResultReport({
                    transaction,
                    pluginAddress,
                    proposalId,
                    stageId,
                });

            // Correlation alone is not evidence. History serves executed transactions, and executed
            // is not successful: one that emitted `ExecutionFailure` consumed its nonce and reported
            // nothing. `isSuccessful: null` is the service declining to say, and is accepted.
            const isEffective =
                transaction.isExecuted && transaction.isSuccessful !== false;

            if (
                report != null &&
                isEffective &&
                report.resultType === resultType
            ) {
                return {
                    outcome: SafeSettledReportOutcome.FOUND,
                    transaction,
                    report,
                };
            }
        }

        // An empty page ends the walk. Without this the offset never advances and the scan spends
        // its whole budget refetching one page, then blames the budget for a walked-out history.
        if (response.next == null || response.results.length === 0) {
            return { outcome: SafeSettledReportOutcome.NOT_REPORTED };
        }

        offset += response.results.length;
    }

    return { outcome: SafeSettledReportOutcome.SCAN_EXHAUSTED };
};

const safeSettledReportOptions = (
    params: IFindSettledReportParams,
    options?: QueryOptions<ISafeSettledReportScan>,
): SharedQueryOptions<ISafeSettledReportScan> => ({
    // Keyed off the shared history identity plus the report's own coordinates, so two bodies of the
    // same Safe do not share an answer while still reusing the canonicalised address.
    queryKey: [
        ...safeServiceKeys.safeTransactionHistory({
            urlParams: { network: params.network, address: params.address },
        }),
        params.pluginAddress,
        params.proposalId.toString(),
        params.stageId,
        params.resultType,
    ],
    queryFn: () => findSettledReport(params),
    // Only a recovered report earns freshness. An unresolved scan - whether the history ran out or
    // the budget did - must be retried on the next mount, not frozen into a permanent miss.
    staleTime: (query) =>
        query.state.data?.outcome === SafeSettledReportOutcome.FOUND
            ? settledReportStaleTime
            : 0,
    gcTime: safeQueryGcTime,
    ...options,
});

/**
 * Recovers the executed report behind a settled body, and says why when it cannot.
 */
export const useSafeSettledReport = (
    params: IUseSafeSettledReportParams,
): IUseSafeSettledReportReturn => {
    const { enabled, ...scanParams } = params;

    const {
        data: scan,
        isLoading,
        isError,
    } = useQuery(safeSettledReportOptions(scanParams, { enabled }));

    return {
        settledReport:
            scan?.outcome === SafeSettledReportOutcome.FOUND ? scan : undefined,
        outcome: scan?.outcome,
        isLoading: enabled && isLoading,
        isError,
    };
};
