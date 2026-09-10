'use client';

import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { safeService, safeServiceKeys } from '@/shared/api/safeService';
import {
    settledHistoryMaxPages,
    settledHistoryPageSize,
} from '../../constants';
import { safeMultisigTransactionUtils } from '../../utils/safeMultisigTransactionUtils';
import type { ISafeMultisigSettledReport } from '../useSafeMultisigBodyState';
import type {
    IFindSettledReportParams,
    IUseSafeSettledReportParams,
    IUseSafeSettledReportReturn,
} from './useSafeSettledReport.api';

/**
 * Scans a Safe's executed transactions backwards for the one that reported this body's verdict.
 *
 * Paged rather than a single read: history is ordered by descending nonce, and a treasury can
 * execute hundreds of unrelated transactions after the report, so the target is not reliably on the
 * first page. Filtering upstream is not an option - a report batched through MultiSend targets the
 * MultiSend contract, not the plugin, so `to` cannot narrow it and correlation has to decode.
 *
 * The scan is bounded by time, not by a page count alone. A Safe executes in strict nonce order, so
 * execution dates fall monotonically as the scan walks back: once a page ends before the stage
 * opened, the report cannot be further back, because `reportProposalResult` reverts for a stage that
 * has not started.
 */
// Misses return `null`, never `undefined`: TanStack Query rejects undefined data, which would turn
// "this report is not in the scanned window" into a query error.
const findSettledReport = async (
    params: IFindSettledReportParams,
): Promise<ISafeMultisigSettledReport | null> => {
    const { network, address, pluginAddress, proposalId, stageId, notBefore } =
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

            if (report != null) {
                return { transaction, report };
            }
        }

        const oldest = response.results.at(-1);

        if (response.next == null || oldest == null) {
            return null;
        }

        const executedAt =
            oldest.executionDate == null
                ? undefined
                : DateTime.fromISO(oldest.executionDate);

        if (notBefore != null && executedAt != null && executedAt < notBefore) {
            return null;
        }

        offset += response.results.length;
    }

    return null;
};

/**
 * Recovers the executed report behind a settled body.
 *
 * Keyed off the shared history identity plus the report's own coordinates, so two bodies of the same
 * Safe do not share an answer while still reusing the canonicalised address.
 */
export const useSafeSettledReport = (
    params: IUseSafeSettledReportParams,
): IUseSafeSettledReportReturn => {
    const {
        network,
        address,
        pluginAddress,
        proposalId,
        stageId,
        notBefore,
        enabled,
    } = params;

    const {
        data: settledReport,
        isLoading,
        isError,
    } = useQuery({
        queryKey: [
            ...safeServiceKeys.safeTransactionHistory({
                urlParams: { network, address },
            }),
            pluginAddress,
            proposalId.toString(),
            stageId,
        ],
        queryFn: () =>
            findSettledReport({
                network,
                address,
                pluginAddress,
                proposalId,
                stageId,
                notBefore,
            }),
        // Executed transactions are immutable, so an answer never needs refreshing.
        staleTime: Number.POSITIVE_INFINITY,
        enabled,
    });

    return {
        settledReport: settledReport ?? undefined,
        isLoading: enabled && isLoading,
        isError,
    };
};
