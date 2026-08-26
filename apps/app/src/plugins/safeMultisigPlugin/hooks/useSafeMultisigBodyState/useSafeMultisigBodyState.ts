'use client';

import { keepPreviousData } from '@tanstack/react-query';
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
        { urlParams, queryParams: { currentNonce: currentNonce ?? '0' } },
        {
            enabled: isNetworkSupported && currentNonce != null && !isSettled,
            // The queue is keyed by the nonce it was read against, so keeping the previous page
            // is what lets a transaction that dies while on screen be re-derived as superseded.
            placeholderData: keepPreviousData,
            refetchInterval,
        },
    );

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
        if (currentNonce == null || isSettled) {
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
        isSettled,
    ]);

    const signers =
        pendingReport?.transaction.confirmations.map(({ owner }) => owner) ??
        [];

    return {
        safeInfo,
        isLoading: isSafeInfoLoading || (!isSettled && isTransactionsLoading),
        isError: isSafeInfoError || (!isSettled && isTransactionsError),
        isRateLimited: rateLimitedError != null,
        rateLimitedRetryAfter: rateLimitedError?.retryAfter,
        pendingReport,
        settledResultType: bodyResult?.resultType,
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
