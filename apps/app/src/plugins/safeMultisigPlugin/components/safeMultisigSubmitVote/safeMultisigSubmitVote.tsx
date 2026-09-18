'use client';

import {
    AlertCard,
    Button,
    DateFormat,
    Dropdown,
    formatterUtils,
    IconType,
    Link,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { Hex } from 'viem';
import { useBytecode } from 'wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { GovernanceServiceKey } from '@/modules/governance/api/governanceService';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { SafeDialogId } from '@/modules/safe/constants';
import type { ISafeProposalTransactionDialogParams } from '@/modules/safe/dialogs/safeProposalTransactionDialog';
import type { ISppVotingTerminalBodyVoteDefaultProps } from '@/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalBodyVoteDefault';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { safeServiceKeys } from '@/shared/api/safeService';
import {
    TransactionType,
    useTransactionStatus,
} from '@/shared/api/transactionService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { pendingTransactionManager } from '@/shared/utils/pendingTransactionManager';
import {
    safeBodyPluginId,
    safeIndexingPollInterval,
    safeIndexingTimeout,
} from '../../constants';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';
import { SafeTransactionState } from '../../types';
import { safeMultisigProposalUtils } from '../../utils/safeMultisigProposalUtils';

export interface ISafeMultisigSubmitVoteProps
    extends ISppVotingTerminalBodyVoteDefaultProps {}

const translationKey = 'app.plugins.safeMultisig.safeMultisigSubmitVote';

export const SafeMultisigSubmitVote: React.FC<ISafeMultisigSubmitVoteProps> = (
    props,
) => {
    const { daoId, proposal, externalAddress, stage, isVeto } = props;
    const { isEnabled } = useFeatureFlags();
    const isSafeAccountPageEnabled = isEnabled('safeAccountPage');
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const queryClient = useQueryClient();
    const { address: connectedAddress } = useWalletAccount();
    /**
     * The Safe body is an external plugin, so it has no `interfaceType` of its own: the registry
     * addresses its slots by `safeBodyPluginId`, the same id `sppStageUtils.getBodyPluginId`
     * resolves for a Safe on a supported chain.
     *
     * The guard pins this object in a ref on its first render, so the card is keyed to one Safe for
     * its lifetime. A different body must be a different card, which is how the terminal renders
     * them - the memo keeps the object from churning on every render in the meantime.
     */
    const guardPlugin = useMemo(
        () =>
            ({
                address: externalAddress,
                interfaceType: safeBodyPluginId,
            }) as unknown as IDaoPlugin,
        [externalAddress],
    );
    const { check: submitVoteGuard, result: canSubmitVote } =
        usePermissionCheckGuard({
            permissionNamespace: 'vote',
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            plugin: guardPlugin,
            daoId,
            proposal,
        });
    const { requiredChainId } = useNetworkSwitch({
        network: proposal.network,
    });
    const [actionError, setActionError] = useState<string>();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [executedHash, setExecutedHash] = useState<Hex>();
    const [hasIndexingTimedOut, setHasIndexingTimedOut] = useState(false);
    const intentId = `safe-proposal:${proposal.network}:${externalAddress.toLowerCase()}:${proposal.id}:${stage.stageIndex}:${isVeto ? 'veto' : 'vote'}`;
    const pendingExecution = useSyncExternalStore(
        pendingTransactionManager.subscribe,
        () => pendingTransactionManager.get(intentId),
        () => undefined,
    );
    const hasExecutionRecovery =
        pendingExecution?.hash != null || pendingExecution?.recovery != null;

    const bodyState = useSafeMultisigBodyState({
        network: proposal.network,
        address: externalAddress,
        proposal,
        stage,
    });
    const {
        safeInfo,
        pendingReport,
        hasConnectedWalletSigned,
        settledResultType,
        isStale,
        isRateLimited,
        rateLimitedRetryAfter,
        isExecutableNow,
        isCurrentNonceFree,
        nonceDistance,
        canStillAffectOutcome,
        isStageCurrent,
    } = bodyState;

    const liveReport =
        pendingReport?.state === SafeTransactionState.LIVE
            ? pendingReport
            : undefined;
    const thresholdReached =
        liveReport != null &&
        safeMultisigProposalUtils.isThresholdReached(liveReport.transaction);

    /**
     * Whether this owner's confirmation is the one that reaches the threshold, so execution follows
     * in the same flow and the wallet opens twice: once to sign for free, once to pay gas.
     *
     * Covers the first confirmation too: on a 1-of-n Safe, proposing already satisfies the
     * threshold, so execution can be offered as the next explicit step.
     */
    const willCompleteThreshold =
        !thresholdReached &&
        !hasConnectedWalletSigned &&
        (liveReport != null
            ? liveReport.transaction.confirmations.length + 1 >=
              liveReport.transaction.confirmationsRequired
            : safeInfo != null && safeInfo.threshold <= 1);

    /**
     * Whether execution can actually follow the confirmation. Reaching the threshold is not enough:
     * a Safe executes in strict nonce order, so a transaction sitting behind another is signed and
     * waiting, and attempting it would pay gas for a revert.
     *
     * An existing report answers for itself; a report that does not exist yet lands on the lowest
     * free nonce, so it is executable only when the current one is unoccupied.
     */
    const canBundleExecution =
        willCompleteThreshold &&
        (liveReport != null ? isExecutableNow : isCurrentNonceFree);
    const supportsEip1271Signatures =
        safeMultisigProposalUtils.supportsEip1271Signatures(
            safeInfo?.version ?? null,
        );
    const {
        data: connectedAccountBytecode,
        isLoading: isContractOwnerCheckLoading,
    } = useBytecode({
        address: connectedAddress,
        chainId: requiredChainId,
        query: {
            enabled: connectedAddress != null && !supportsEip1271Signatures,
        },
    });
    const hasUnsupportedContractOwner =
        !supportsEip1271Signatures && connectedAccountBytecode != null;
    const hasSettled = settledResultType != null;

    /**
     * Between a successful execution and the indexer ingesting it, the Safe queue no longer holds
     * the report (it is executed, so the `executed=false` read drops it) and the indexed body
     * result does not exist yet. Without holding the action across that window the card falls back
     * to its idle CTA and invites a duplicate report at the next nonce.
     *
     * The hold is bounded: the status endpoint answers `{ isProcessed: false }` for any hash it
     * cannot attribute, so a stalled indexer looks exactly like a slow one and would otherwise
     * hold the card forever behind a spinner with no way out.
     */
    const isAwaitingIndexing =
        executedHash != null && !hasSettled && !hasIndexingTimedOut;

    const { data: executedTransactionStatus } = useTransactionStatus(
        {
            urlParams: {
                network: proposal.network,
                transactionHash: executedHash ?? '',
            },
            queryParams: { type: TransactionType.PROPOSAL_REPORT_RESULTS },
        },
        {
            enabled: isAwaitingIndexing,
            refetchInterval: ({ state }) =>
                state.data?.isProcessed === true
                    ? false
                    : safeIndexingPollInterval,
        },
    );

    const isReportIndexed = executedTransactionStatus?.isProcessed === true;

    useEffect(() => {
        if (!isReportIndexed) {
            return;
        }

        void queryClient.invalidateQueries({
            queryKey: [GovernanceServiceKey.PROPOSAL_BY_SLUG],
        });
        void queryClient.invalidateQueries({
            queryKey: [GovernanceServiceKey.PROPOSAL_LIST],
        });
    }, [isReportIndexed, queryClient]);

    useEffect(() => {
        if (executedHash == null || hasSettled) {
            return;
        }

        const timeout = setTimeout(
            () => setHasIndexingTimedOut(true),
            safeIndexingTimeout,
        );

        return () => clearTimeout(timeout);
    }, [executedHash, hasSettled]);

    useEffect(() => {
        if (
            hasSettled &&
            executedHash != null &&
            pendingExecution?.hash === executedHash
        ) {
            pendingTransactionManager.clear(intentId);
        }
    }, [executedHash, hasSettled, intentId, pendingExecution?.hash]);

    const invalidateSafeState = async () => {
        if (safeInfo == null) {
            return;
        }

        const urlParams = {
            network: proposal.network,
            address: externalAddress,
        };

        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: safeServiceKeys.safeInfo({ urlParams }),
            }),
            queryClient.invalidateQueries({
                queryKey: safeServiceKeys.safePendingTransactions({
                    urlParams,
                }),
            }),
            // An execution that just happened is what the history scan looks for. Without this the
            // settled read serves its pre-execution answer until it goes stale on its own.
            //
            // By prefix, not by exact entry: the scan keys on the verdict SPP has *indexed*, which
            // during this very window is still the pre-execution one, so an exact key built from
            // the verdict just reported would invalidate an entry nothing reads. The prefix covers
            // every variant for this Safe.
            queryClient.invalidateQueries({
                queryKey: safeServiceKeys.safeTransactionHistory({
                    urlParams,
                }),
            }),
        ]);
    };

    const openTransactionDialog = (bundleExecution: boolean) => {
        setActionError(undefined);
        open(SafeDialogId.PROPOSAL_TRANSACTION, {
            params: {
                intentId,
                daoId,
                proposal,
                externalAddress,
                stage,
                isVeto,
                bundleExecution,
                pendingTransaction: liveReport?.transaction,
                onExecuted: (hash) => {
                    setHasIndexingTimedOut(false);
                    setExecutedHash(hash);
                },
                onSafeStateChange: invalidateSafeState,
            } satisfies ISafeProposalTransactionDialogParams,
        });
    };

    /**
     * Bundling is the default: when the confirmation completes the threshold there is nothing left
     * to wait for, so executing in the same flow saves a second visit. `Approve only` opts out and
     * leaves the fully-signed transaction in the queue for any owner to execute.
     *
     * Connection and Safe ownership are the standard vote guard's business, so an unconnected or
     * non-owner wallet gets the wallet dialog and then the permission dialog - not a message
     * beside the button.
     */
    const handleVoteClick = (bundleExecution = true) =>
        hasExecutionRecovery || canSubmitVote
            ? openTransactionDialog(bundleExecution)
            : submitVoteGuard({
                  onSuccess: () => openTransactionDialog(bundleExecution),
              });

    const isSuperseded =
        pendingReport?.state === SafeTransactionState.SUPERSEDED;
    const isWaitingForOwners =
        liveReport != null && hasConnectedWalletSigned && !thresholdReached;

    // A signature binds an exact nonce. Gaps and competing transactions mean nonce distance
    // cannot tell us how many queued transactions exist.
    const isQueuedBehindNonce = thresholdReached && nonceDistance > 0;

    // Below threshold the action produces a confirmation, so it is named for its governance intent.
    // At threshold the only thing left is executing a Safe transaction, and that is named for the
    // Safe: "Execute approval" reads as executing the proposal, which is a later step in an SPP
    // process and someone else's permission.
    let buttonKey = isVeto ? 'veto' : 'approve';

    if (canBundleExecution) {
        buttonKey = isVeto ? 'vetoAndExecute' : 'approveAndExecute';
    }

    if (hasExecutionRecovery) {
        buttonKey = 'resumeExecution';
    } else if (hasSettled) {
        buttonKey = isVeto ? 'vetoed' : 'approved';
    } else if (isAwaitingIndexing) {
        buttonKey = 'finalizing';
    } else if (thresholdReached) {
        buttonKey = 'executeSafeTransaction';
    } else if (isSuperseded) {
        // The signatures died with the nonce, so this is a fresh signing round, not a resend -
        // named for the act it re-opens, with the alert above stating what was lost.
        buttonKey = isVeto ? 'vetoAndRequeue' : 'approveAndRequeue';
    }

    let helperText: string | undefined;

    if (hasUnsupportedContractOwner) {
        helperText = t(`${translationKey}.versionUnsupported`, {
            version: safeInfo?.version ?? t(`${translationKey}.unknownVersion`),
        });
    } else if (isAwaitingIndexing) {
        helperText = t(`${translationKey}.awaitingIndexing`);
    } else if (hasIndexingTimedOut && !hasSettled) {
        helperText = t(`${translationKey}.indexingDelayed`);
    } else if (thresholdReached && !hasSettled) {
        // A Safe body passes through two gates, and gov-ui-kit's card only shows the first: enough
        // owners have confirmed. Until the Safe transaction executes, Aragon has been told nothing
        // and this body counts for nothing - so the second gate is named rather than implied.
        helperText = t(`${translationKey}.awaitingExecution`);
    } else if (isWaitingForOwners) {
        helperText = t(`${translationKey}.waitingForOwners`);
    }

    // Safe-only realities are alerts, not layout: the card keeps the multisig grammar and says what
    // is true about the queue underneath it.
    const alerts: Array<{
        key: string;
        variant: 'info' | 'warning' | 'critical';
        message: string;
    }> = [];

    /**
     * The two surprising states, stated rather than left to be inferred.
     *
     * A Safe transaction never expires and a verdict has no deadline, so while the stage can still
     * advance the owners can still act and it still counts. Once `maxAdvance` has passed the stage
     * can never advance: the transaction remains executable in the Safe forever, but it can no
     * longer move this proposal.
     *
     * Role-specific, because the two cases are not the same fact. A late approval waits to be
     * counted; a late veto is decisive - the contract recomputes `_thresholdsMet` on every read, so
     * a recorded veto blocks advancement until `maxAdvance` expires, and an advance landing first
     * forfeits it.
     */
    const stageEndDate = sppStageUtils.getStageEndDate(proposal, stage);
    const hasWindowClosed =
        stageEndDate != null && DateTime.now() > stageEndDate;

    if (!hasSettled && hasWindowClosed && canStillAffectOutcome) {
        alerts.push({
            key: 'stillCounts',
            variant: 'info',
            message: t(
                `${translationKey}.${isVeto ? 'stillCountsVeto' : 'stillCounts'}`,
            ),
        });
    }

    if (!hasSettled && !canStillAffectOutcome) {
        alerts.push({
            key: 'stageExpired',
            variant: 'warning',
            message: t(
                `${translationKey}.${liveReport != null ? 'stageExpiredQueued' : 'stageExpired'}`,
            ),
        });
    }

    /**
     * The mirror of `stageExpiredQueued`, for after the write rather than before it. A report can
     * land on a stage that has already advanced: the record is stored and the gas is spent, but it
     * moved nothing. Left unsaid, the settled surface shows a verdict with a checkmark and reads
     * as though it decided something - the one place this card would claim authority it lacks.
     *
     * Keyed on `isStageCurrent` rather than `canStillAffectOutcome`, which also goes false when a
     * stage merely expires unadvanced - true of a dead proposal, but not an advance.
     */
    if (hasSettled && !isStageCurrent) {
        alerts.push({
            key: 'recordedAfterAdvance',
            variant: 'warning',
            message: t(`${translationKey}.recordedAfterAdvance`),
        });
    }

    if (isQueuedBehindNonce) {
        alerts.push({
            key: 'nonceQueued',
            variant: 'warning',
            message: t(`${translationKey}.nonceQueued`, {
                currentNonce: safeInfo?.nonce,
                transactionNonce: liveReport?.transaction.nonce,
            }),
        });
    }

    /**
     * Two transactions on one nonce are mutually exclusive: whichever executes first consumes the
     * nonce and voids the other, however completely it was signed. Worth saying before the
     * signatures are spent - afterwards the report is already superseded and only re-queueable.
     */
    if (liveReport?.hasNonceCompetition === true && !hasSettled) {
        alerts.push({
            key: 'nonceShared',
            variant: 'warning',
            message: t(`${translationKey}.nonceShared`),
        });
    }

    if (isSuperseded) {
        alerts.push({
            key: 'replaced',
            variant: 'critical',
            message: t(`${translationKey}.replaced`),
        });
    }

    /**
     * Two reasons the numbers may lag, and they are independent: a spent read budget 429s the
     * queue read while `safeInfo` still answers fresh, so gating on staleness alone left the card
     * silent with frozen counts. Only one of them is worth a button - every refetch against an
     * exhausted budget returns the same 429, so the wait is the remedy and the copy says so.
     */
    const getLaggingReadMessage = () => {
        if (!isRateLimited) {
            return t(`${translationKey}.unreachable`);
        }

        // The service states its own wait; without one there is no countdown to promise, and the
        // app has no published window to fall back on - Safe documents a per-second rate and a
        // monthly quota, never an hourly one. Shown as a duration: "300 seconds" is arithmetic.
        if (rateLimitedRetryAfter == null) {
            return t(`${translationKey}.budgetSpent`);
        }

        return t(`${translationKey}.budgetSpentRetry`, {
            wait: formatterUtils.formatDate(
                Date.now() + rateLimitedRetryAfter * 1000,
                { format: DateFormat.DURATION },
            ),
        });
    };

    if (isStale || isRateLimited) {
        alerts.push({
            key: 'stale',
            variant: 'warning',
            message: getLaggingReadMessage(),
        });
    }
    /**
     * The route to the account queue while this report actually occupies a slot there. It is where
     * an owner sees co-signer state, and it stays worth offering even once the stage can no longer
     * advance - the transaction is lost to the proposal, not to the Safe's queue, which still
     * holds it. Superseded means the transaction lost the nonce and is filtered out of the queue as
     * permanently dead; re-queued lives at a fresh nonce this address does not know. Executed is
     * the breakdown's provenance links, not a queue lookup.
     */
    const queuedReportHref =
        pendingReport == null ||
        isSuperseded ||
        pendingReport.state === SafeTransactionState.EXECUTED
            ? undefined
            : `/safe/${proposal.network}/${externalAddress}`;

    const isActionDisabled =
        !hasExecutionRecovery &&
        (hasSettled ||
            executedHash != null ||
            isWaitingForOwners ||
            isQueuedBehindNonce ||
            hasUnsupportedContractOwner ||
            isContractOwnerCheckLoading ||
            safeInfo == null);
    return (
        <div className="flex w-full flex-col gap-3">
            {alerts.map((alert) => (
                <AlertCard
                    key={alert.key}
                    message={alert.message}
                    variant={alert.variant}
                />
            ))}
            {!hasSettled && helperText != null && (
                <p className="font-normal text-neutral-500 text-sm leading-normal">
                    {helperText}
                </p>
            )}
            {actionError != null && (
                <p className="text-critical-500 text-sm leading-normal">
                    {actionError}
                </p>
            )}
            {/* Nothing to offer once the stage can never advance: acting would change nothing, and
                a disabled action beside an expired stage only invites the question.

                A settled body keeps the slot: the verdict reads as the action that was taken, and
                the card does not reflow the moment a body reports. */}
            {(hasExecutionRecovery ||
                hasSettled ||
                canStillAffectOutcome ||
                queuedReportHref != null) && (
                <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
                    {(hasExecutionRecovery ||
                        hasSettled ||
                        canStillAffectOutcome) && (
                        <>
                            {/* Signing and executing are separate acts, so the two routes are peers inside
                        one button rather than a primary with an opt-out: an owner who only wants to
                        authorise can leave the gas to whoever executes. Offered only when execution
                        would actually follow and the card is idle - otherwise there is nothing to
                        choose between. */}
                            {canBundleExecution &&
                            !hasSettled &&
                            !hasExecutionRecovery &&
                            !isAwaitingIndexing ? (
                                <Dropdown.Container
                                    align="end"
                                    constrainContentWidth={false}
                                    disabled={isActionDisabled}
                                    label={t(
                                        `${translationKey}.${isVeto ? 'veto' : 'approve'}`,
                                    )}
                                    size="md"
                                    variant="primary"
                                >
                                    <Dropdown.Item
                                        onClick={() => handleVoteClick(true)}
                                    >
                                        {t(
                                            `${translationKey}.${isVeto ? 'vetoAndExecute' : 'approveAndExecute'}`,
                                        )}
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => handleVoteClick(false)}
                                    >
                                        {t(
                                            `${translationKey}.${isVeto ? 'vetoOnly' : 'approveOnly'}`,
                                        )}
                                    </Dropdown.Item>
                                </Dropdown.Container>
                            ) : (
                                <Button
                                    className="w-full md:w-fit"
                                    disabled={isActionDisabled}
                                    iconLeft={
                                        hasSettled
                                            ? IconType.CHECKMARK
                                            : undefined
                                    }
                                    isLoading={
                                        isAwaitingIndexing &&
                                        !hasExecutionRecovery
                                    }
                                    onClick={
                                        hasSettled && !hasExecutionRecovery
                                            ? undefined
                                            : () => handleVoteClick(true)
                                    }
                                    size="md"
                                    variant={
                                        hasSettled ? 'secondary' : 'primary'
                                    }
                                >
                                    {t(`${translationKey}.${buttonKey}`)}
                                </Button>
                            )}
                            {/* Only when a re-read can actually change the answer, and named for
                                what it re-reads: beside a vote button, "Retry" reads as retrying
                                the vote. */}
                            {((isStale && !isRateLimited) ||
                                (hasIndexingTimedOut && !hasSettled)) && (
                                <Button
                                    className="w-full md:w-fit"
                                    isLoading={isRefreshing}
                                    onClick={() => {
                                        setActionError(undefined);
                                        setIsRefreshing(true);
                                        void Promise.all([
                                            invalidateSafeState(),
                                            queryClient.invalidateQueries({
                                                queryKey: [
                                                    GovernanceServiceKey.PROPOSAL_BY_SLUG,
                                                ],
                                            }),
                                            queryClient.invalidateQueries({
                                                queryKey: [
                                                    GovernanceServiceKey.PROPOSAL_LIST,
                                                ],
                                            }),
                                        ])
                                            .catch(() => {
                                                setActionError(
                                                    t(
                                                        `${translationKey}.error`,
                                                    ),
                                                );
                                            })
                                            .finally(() =>
                                                setIsRefreshing(false),
                                            );
                                    }}
                                    size="md"
                                    variant="tertiary"
                                >
                                    {t(`${translationKey}.refreshSafeState`)}
                                </Button>
                            )}
                        </>
                    )}
                    {/* The queued transaction, offered beside the action rather than above it: it
                        is where an owner goes to see co-signer state, so it reads as the second
                        route out of the card. The account queue shows it regardless of whether the
                        stage can still advance - the transaction is lost to the proposal, not to
                        the queue. Absent when there is no transaction to see. */}
                    {isSafeAccountPageEnabled && queuedReportHref != null && (
                        <Link
                            href={queuedReportHref}
                            isExternal={true}
                            showUrl={false}
                            textClassName="text-sm"
                        >
                            {t(`${translationKey}.viewInAccountQueue`)}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};
