'use client';

import { keepPreviousData } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { safeShortNameFromNetwork } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import {
    SafeServiceError,
    useSafeInfo,
    useSafePendingTransactions,
} from '@/shared/api/safeService';
import { safeBodyPollInterval } from '../../constants';
import { SafeTransactionState } from '../../types';
import { safeMultisigProposalUtils } from '../../utils/safeMultisigProposalUtils';
import { safeMultisigTransactionUtils } from '../../utils/safeMultisigTransactionUtils';
import { useSafeSettledReport } from '../useSafeSettledReport';
import type {
    ISafeMultisigBodyReport,
    IUseSafeMultisigBodyStateParams,
    IUseSafeMultisigBodyStateReturn,
} from './useSafeMultisigBodyState.api';

/**
 * Composes the Safe reads and the pure liveness and correlation rules into the view model of a
 * Safe body card.
 *
 * The reads are wallet-independent: the card is informative to an observer with no wallet
 * connected, and polling never restarts on connect or account change. Only "you have signed"
 * depends on the connected account.
 */
export const useSafeMultisigBodyState = (
    params: IUseSafeMultisigBodyStateParams,
): IUseSafeMultisigBodyStateReturn => {
    const { network, address, proposal, stage } = params;

    const { address: connectedAddress } = useWalletAccount();

    const isNetworkSupported = safeShortNameFromNetwork(network) != null;
    const bodyResult = sppStageUtils.getBodyResult(
        proposal,
        address,
        stage.stageIndex,
    );
    const isSettled = bodyResult != null;

    /**
     * Whether a verdict landing now would still be recorded: `reportProposalResult` has no
     * deadline, so this turns on the stage still being the current one, never on the voting window
     * having elapsed.
     */
    const isStageCurrent =
        stage.stageIndex === proposal.stageIndex && !proposal.executed.status;

    /**
     * Whether it could still change anything. `maxAdvance` is an onchain bound - SPP's `state`
     * returns `Expired` once `lastStageTransition + maxAdvance` has passed, and advancing requires
     * `Advanceable` - so beyond it a Safe transaction still executes but the proposal is stuck.
     */
    const maxAdvanceDate = sppStageUtils.getStageMaxAdvance(proposal, stage);
    const canStillAffectOutcome =
        isStageCurrent &&
        maxAdvanceDate != null &&
        DateTime.now() < maxAdvanceDate;

    // The queue read costs Safe transaction service quota, so it polls only while it holds a
    // transaction that can still execute; otherwise the default focus refetch is enough.
    const [isQueueLive, setIsQueueLive] = useState(false);

    /**
     * A rate-limited read means the shared quota is already exhausted, so the poll must slow down
     * rather than keep asking at the normal cadence. The upstream `Retry-After` is honoured when it
     * is longer than the usual interval.
     */
    const pollWhile = useCallback(
        (isActive: boolean) =>
            ({ state }: { state: { error: unknown } }) => {
                if (!isActive) {
                    return false as const;
                }

                const retryAfter = SafeServiceError.isRateLimitedError(
                    state.error,
                )
                    ? state.error.retryAfter
                    : undefined;

                return Math.max(safeBodyPollInterval, (retryAfter ?? 0) * 1000);
            },
        [],
    );

    /**
     * Owners and threshold change with no DAO transaction and nothing queued: an owner added while
     * this page is open changes who may report and how many confirmations it takes. Tying this read
     * to the queue left the card describing the Safe as it was when the page loaded until a focus
     * change happened to refresh it.
     *
     * Affordable because it is served from Aragon's own contract reads, not the rate-limited Safe
     * service - so it follows what the body can still do rather than what is already queued.
     */
    const infoRefetchInterval = useMemo(
        () => pollWhile(canStillAffectOutcome || isQueueLive),
        [pollWhile, canStillAffectOutcome, isQueueLive],
    );
    const queueRefetchInterval = useMemo(
        () => pollWhile(isQueueLive),
        [pollWhile, isQueueLive],
    );

    const urlParams = useMemo(() => ({ network, address }), [network, address]);

    const {
        data: safeInfo,
        isLoading: isSafeInfoLoading,
        isError: isSafeInfoError,
        error: safeInfoError,
    } = useSafeInfo(
        { urlParams },
        { enabled: isNetworkSupported, refetchInterval: infoRefetchInterval },
    );

    const currentNonce = safeInfo?.nonce;

    const {
        data: pendingTransactions,
        isLoading: isTransactionsLoading,
        isError: isTransactionsError,
        error: transactionsError,
    } = useSafePendingTransactions(
        { urlParams },
        {
            // Read while this stage can still be reported on, which an indexed result does not end:
            // a Safe transaction has no expiry, so a queued report can execute later and overwrite
            // the recorded verdict. Past the stage the queue is moot and the read stops.
            enabled: isNetworkSupported && isStageCurrent,
            placeholderData: keepPreviousData,
            refetchInterval: queueRefetchInterval,
        },
    );

    /**
     * Only scanned once a verdict is recorded. Until then the queue holds everything worth showing,
     * and this read costs Safe quota where `info` does not.
     *
     * The recorded verdict bounds it instead of a date: `reportProposalResult` rejects only a
     * future stage, so a report can execute before its stage opened, and what identifies the right
     * transaction is the result it carried rather than when it ran.
     */
    const {
        settledReport,
        outcome: settledReportOutcome,
        isLoading: isSettledReportLoading,
        isError: isSettledReportError,
    } = useSafeSettledReport({
        network,
        address,
        pluginAddress: proposal.pluginAddress,
        proposalId: BigInt(proposal.proposalIndex),
        stageId: stage.stageIndex,
        resultType: bodyResult?.resultType ?? SppProposalType.NONE,
        enabled: isNetworkSupported && isSettled,
    });

    // The backend serves a stale payload rather than failing when its own fresh window has lapsed.
    // That is the right trade for a signing UI, but the user has to be told the count may lag.
    const isStale =
        pendingTransactions?.meta.stale === true ||
        safeInfo?.meta.stale === true;

    const rateLimitedError = [safeInfoError, transactionsError].find((error) =>
        SafeServiceError.isRateLimitedError(error),
    );

    const transactions = useMemo(
        () => pendingTransactions?.results ?? [],
        [pendingTransactions],
    );

    const liveTransactionCount =
        currentNonce == null
            ? 0
            : safeMultisigProposalUtils.filterLiveTransactions({
                  transactions,
                  currentNonce,
              }).length;

    useEffect(() => {
        setIsQueueLive(liveTransactionCount > 0);
    }, [liveTransactionCount]);

    const { pluginAddress, proposalIndex } = proposal;
    const { stageIndex } = stage;

    const pendingReport = useMemo(() => {
        if (currentNonce == null) {
            return undefined;
        }

        const reports: ISafeMultisigBodyReport[] = [];

        for (const transaction of transactions) {
            const report =
                safeMultisigTransactionUtils.findProposalResultReport({
                    transaction,
                    pluginAddress,
                    proposalId: proposalIndex,
                    stageId: stageIndex,
                });

            if (report != null) {
                reports.push({
                    transaction,
                    report,
                    state: safeMultisigProposalUtils.getTransactionState({
                        transaction,
                        currentNonce,
                    }),
                    status: safeMultisigProposalUtils.getTransactionStatus({
                        transaction,
                        currentNonce,
                    }),
                    hasNonceCompetition:
                        safeMultisigProposalUtils.hasNonceCompetition({
                            transactions,
                            transaction,
                        }),
                });
            }
        }

        // A superseded report is only worth showing when nothing executable is left.
        return (
            reports.find(({ state }) => state === SafeTransactionState.LIVE) ??
            reports[0]
        );
    }, [transactions, currentNonce, pluginAddress, proposalIndex, stageIndex]);

    /**
     * The transaction this body's verdict rests on. The executed report wins: once a verdict is
     * recorded, a later queued attempt is an attempt, not the record. Counts and signers both come
     * from it, so they cannot disagree.
     *
     * The queue is therefore not a fallback once the body has settled. A decided body whose report
     * the scan did not recover has no confirmations to show - presenting an unexecuted attempt's
     * signatures as the verdict's would be the misattribution this read exists to prevent, and the
     * surfaces carry outcome-specific copy for exactly that gap.
     */
    const reportTransaction = isSettled
        ? settledReport?.transaction
        : pendingReport?.transaction;

    // A settled body's confirmations are the ones that executed it; the queue no longer serves them.
    const signers =
        reportTransaction?.confirmations.map(({ owner }) => owner) ?? [];

    // Nonce-exact: a Safe binds every signature to one nonce, so only the report sitting on the
    // Safe's current nonce can execute. Anything further back is waiting, however well signed.
    const reportNonce = pendingReport?.transaction.nonce;
    const nonceGap =
        reportNonce == null || currentNonce == null
            ? 0
            : BigInt(reportNonce) - BigInt(currentNonce);

    /**
     * Whether nothing in the queue holds the Safe's current nonce. Allocation hands out the lowest
     * free slot, so an empty current nonce is the one case where a newly proposed report executes
     * the moment it reaches threshold. `isExecutableNow` cannot answer this: it needs a report to
     * already exist.
     */
    const isCurrentNonceFree =
        currentNonce != null &&
        !transactions.some(
            ({ nonce, isExecuted }) =>
                !isExecuted && BigInt(nonce) === BigInt(currentNonce),
        );

    return {
        safeInfo,
        /**
         * Each read only counts while it is the one being consulted: the queue while the stage is
         * reportable, the history scan once a verdict is recorded. Leaving the scan out made a
         * settled Votes tab claim "no confirmations yet" while it was still fetching.
         */
        isLoading:
            isSafeInfoLoading ||
            (isStageCurrent && isTransactionsLoading) ||
            isSettledReportLoading,
        isError:
            isSafeInfoError ||
            (isStageCurrent && isTransactionsError) ||
            isSettledReportError,
        isRateLimited: rateLimitedError != null,
        rateLimitedRetryAfter: rateLimitedError?.retryAfter,
        isStale,
        pendingReport,
        settledReport,
        settledReportOutcome,
        settledResultType: bodyResult?.resultType,
        isStageCurrent,
        canStillAffectOutcome,
        isExecutableNow:
            pendingReport != null &&
            !pendingReport.transaction.isExecuted &&
            nonceGap === BigInt(0),
        isCurrentNonceFree,
        nonceDistance: nonceGap > BigInt(0) ? Number(nonceGap) : 0,
        signers,
        hasConnectedWalletSigned:
            pendingReport != null &&
            safeMultisigProposalUtils.hasAddressConfirmed({
                transaction: pendingReport.transaction,
                address: connectedAddress,
            }),
        /**
         * The transaction's own `confirmationsRequired` tracks the rules that applied far better
         * than the live threshold, which is only a stand-in for a body with nothing queued yet -
         * never for a settled one, where it would restate today's rules as history: a report
         * executed by a 1-of-2 Safe would read "2 of 2" once the owners raise the threshold.
         *
         * It is not an immutable proposal-time value though. Upstream derives it from the Safe
         * status at `(safe, nonce)` - the mining-time threshold once executed - and falls back to
         * the Safe's latest status and finally the indexed confirmation count. A queued report has
         * no status at its nonce yet, so this line serves a mining-time threshold for settled
         * reports and a current-threshold fallback while queued. Best available record, not a
         * guarantee. When the scan cannot find the report, these stay empty and the surface says
         * so rather than inventing a count.
         */
        approvalsAmount: reportTransaction?.confirmations.length ?? 0,
        minApprovals:
            reportTransaction?.confirmationsRequired ??
            (isSettled ? 0 : (safeInfo?.threshold ?? 0)),
        /**
         * The owner set that applied is not recoverable from the transaction, so a settled body has
         * no denominator rather than today's count: "1 of 3" against an owner set that has since
         * grown is the same substitution the threshold above refuses to make.
         */
        membersCount: isSettled ? undefined : safeInfo?.owners.length,
    };
};
