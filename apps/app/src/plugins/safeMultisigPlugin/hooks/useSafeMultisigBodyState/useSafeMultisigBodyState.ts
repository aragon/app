'use client';

import { keepPreviousData } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { safeShortNameFromNetwork } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
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

    // An idle body card must cost nothing, so polling only runs while the Safe queue holds a
    // transaction that can still execute; otherwise the default focus refetch is enough.
    const [isQueueLive, setIsQueueLive] = useState(false);

    // A rate-limited read means the shared quota is already exhausted, so the poll must slow down
    // rather than keep asking at the normal cadence. The upstream `Retry-After` is honoured when it
    // is longer than the usual interval.
    const refetchInterval = useCallback(
        ({ state }: { state: { error: unknown } }) => {
            if (!isQueueLive) {
                return false;
            }

            const retryAfter = SafeServiceError.isRateLimitedError(state.error)
                ? state.error.retryAfter
                : undefined;

            return Math.max(safeBodyPollInterval, (retryAfter ?? 0) * 1000);
        },
        [isQueueLive],
    );

    const urlParams = useMemo(() => ({ network, address }), [network, address]);

    const {
        data: safeInfo,
        isLoading: isSafeInfoLoading,
        isError: isSafeInfoError,
        error: safeInfoError,
    } = useSafeInfo(
        { urlParams },
        { enabled: isNetworkSupported, refetchInterval },
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
            refetchInterval,
        },
    );

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
    }, [
        transactions,
        currentNonce,
        pluginAddress,
        proposalIndex,
        stageIndex,
        isStageCurrent,
    ]);

    const signers =
        pendingReport?.transaction.confirmations.map(({ owner }) => owner) ??
        [];

    // Nonce-exact: a Safe binds every signature to one nonce, so only the report sitting on the
    // Safe's current nonce can execute. Anything further back is waiting, however well signed.
    const reportNonce = pendingReport?.transaction.nonce;
    const nonceGap =
        reportNonce == null || currentNonce == null
            ? 0
            : BigInt(reportNonce) - BigInt(currentNonce);

    return {
        safeInfo,
        isLoading:
            isSafeInfoLoading || (isStageCurrent && isTransactionsLoading),
        isError: isSafeInfoError || (isStageCurrent && isTransactionsError),
        isRateLimited: rateLimitedError != null,
        rateLimitedRetryAfter: rateLimitedError?.retryAfter,
        isStale,
        pendingReport,
        settledResultType: bodyResult?.resultType,
        isStageCurrent,
        canStillAffectOutcome,
        isExecutableNow:
            pendingReport != null &&
            !pendingReport.transaction.isExecuted &&
            nonceGap === BigInt(0),
        transactionsAhead: nonceGap > BigInt(0) ? Number(nonceGap) : 0,
        signers,
        hasConnectedWalletSigned:
            pendingReport != null &&
            safeMultisigProposalUtils.hasAddressConfirmed({
                transaction: pendingReport.transaction,
                address: connectedAddress,
            }),
        approvalsAmount: isSettled
            ? (safeInfo?.threshold ?? 0)
            : (pendingReport?.transaction.confirmations.length ?? 0),
        minApprovals:
            pendingReport?.transaction.confirmationsRequired ??
            safeInfo?.threshold ??
            0,
        membersCount: safeInfo?.owners.length ?? 0,
    };
};
