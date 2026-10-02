'use client';

import {
    AlertCard,
    AlertInline,
    Button,
    Dropdown,
    IconType,
    ProposalStatus,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
    safeAppAccountUrl,
    safeAppTransactionUrl,
} from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { SafeDialogId } from '@/modules/safe/constants';
import type { ISafeProposalTransactionDialogParams } from '@/modules/safe/dialogs/safeProposalTransactionDialog';
import type { ISppVotingTerminalBodyVoteDefaultProps } from '@/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalBodyVoteDefault';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { safeServiceKeys } from '@/shared/api/safeService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { safeBodyPluginId } from '../../constants';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';
import { SafeTransactionState } from '../../types';
import { safeMultisigProposalUtils } from '../../utils/safeMultisigProposalUtils';

export interface ISafeMultisigSubmitVoteProps
    extends ISppVotingTerminalBodyVoteDefaultProps {}

const translationKey = 'app.plugins.safeMultisig.safeMultisigSubmitVote';

interface IAlert {
    key: string;
    variant: 'info' | 'warning';
    message: string;
}

export const SafeMultisigSubmitVote: React.FC<ISafeMultisigSubmitVoteProps> = (
    props,
) => {
    const { daoId, proposal, externalAddress, stage, isVeto } = props;
    const { isEnabled } = useFeatureFlags();
    const isSafeAccountPageEnabled = isEnabled('safeAccountPage');
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [bundleExecution, setBundleExecution] = useState(true);

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

    const intentId = `safe-proposal:${proposal.network}:${externalAddress.toLowerCase()}:${proposal.id}:${stage.stageIndex}:${isVeto ? 'veto' : 'vote'}`;

    const {
        safeInfo,
        pendingReport,
        hasConnectedWalletSigned,
        settledResultType,
        settledReport,
        isStale,
        isRateLimited,
        isError,
        isLoading,
        isExecutableNow,
        isCurrentNonceFree,
        nonceBlockerReport,
        nonceDistance,
        canStillAffectOutcome,
    } = useSafeMultisigBodyState({
        network: proposal.network,
        address: externalAddress,
        proposal,
        stage,
    });

    const liveReport =
        pendingReport?.state === SafeTransactionState.LIVE
            ? pendingReport
            : undefined;
    const thresholdReached =
        liveReport != null &&
        safeMultisigProposalUtils.isThresholdReached(liveReport.transaction);

    /**
     * Whether this owner's confirmation is the one that reaches the threshold, so execution can
     * follow in the same flow without a second visit.
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
     */
    const canBundleExecution =
        willCompleteThreshold &&
        (liveReport != null ? isExecutableNow : isCurrentNonceFree);

    const hasSettled = settledResultType != null;
    const isSuperseded =
        !hasSettled && pendingReport?.state === SafeTransactionState.SUPERSEDED;
    const isWaitingForOwners =
        liveReport != null && hasConnectedWalletSigned && !thresholdReached;

    // A live report can be queued before threshold; that warning is separate from the execution
    // gate below, which only disables execution once a signed transaction is behind the nonce.
    const hasQueuedNonce =
        !hasSettled && liveReport != null && nonceDistance > 0;
    const isQueuedBehindNonce =
        !hasSettled && thresholdReached && nonceDistance > 0;

    // An unsigned owner can still add a confirmation whenever their wallet can affect the outcome:
    // below threshold it counts toward it, at or past threshold it adds weight for majority or
    // unanimity, or simply avoids paying gas.
    const canSignNow =
        !hasSettled && !hasConnectedWalletSigned && canStillAffectOutcome;

    // Whether execution can follow in this same flow now: the threshold is met - by this signature
    // or already - and the transaction sits at an executable nonce, not queued behind one.
    const canExecuteNow =
        !hasSettled &&
        !isQueuedBehindNonce &&
        (canBundleExecution || (thresholdReached && isExecutableNow));

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);
    const isAdvanceable = stageStatus === ProposalStatus.ADVANCEABLE;

    /**
     * The proposal holding the Safe's current nonce, when the backend correlated that transaction
     * to exactly one. A Safe can be shared by anything, so an unmatched blocker - or one whose DAO
     * or plugin does not resolve to a route - leaves the warning as it is rather than naming
     * something the reader cannot open.
     */
    const blockerReportParams = {
        incrementalId: nonceBlockerReport?.proposalId ?? 0,
        pluginAddress: nonceBlockerReport?.bodyId ?? '',
    };
    const { data: blockerDao } = useDao(
        { urlParams: { id: nonceBlockerReport?.daoId ?? '' } },
        { enabled: nonceBlockerReport != null },
    );
    const blockerProposalSlug =
        nonceBlockerReport != null
            ? proposalUtils.getProposalSlug(blockerReportParams, blockerDao)
            : undefined;
    const blockerProposalUrl =
        blockerProposalSlug != null
            ? proposalUtils.getProposalUrl(blockerReportParams, blockerDao)
            : undefined;

    /**
     * Every dialog path starts with Safe service reads and writes, so while the service can't be
     * read there is no action to offer: the alert is the slot. `isLoading` alone only disables the
     * button, as a placeholder for the one that arrives.
     */
    const isReadBlocked = isError || isStale || isRateLimited;
    // A spent budget returns the same 429 until the poll backs off and recovers on its own.
    const canRetryRead = !isRateLimited && (isError || isStale);

    // Below threshold the action produces a confirmation, so it is named for its governance intent.
    // At threshold execution is the headline action, but an unsigned owner can still add a
    // confirmation, so a sign-only choice stays available and named for that governance intent.
    let buttonKey = isVeto ? 'veto' : 'approve';

    if (hasSettled) {
        buttonKey = isVeto ? 'vetoedAndExecuted' : 'approvedAndExecuted';
    } else if (thresholdReached) {
        buttonKey = 'executeSafeTransaction';
    } else if (isSuperseded) {
        // The signatures died with the nonce, so this is a fresh signing round, not a resend -
        // named for the act it re-opens, with the alert above stating what was lost.
        buttonKey = isVeto ? 'vetoAndRequeue' : 'approveAndRequeue';
    } else if (isWaitingForOwners) {
        buttonKey = isVeto ? 'vetoed' : 'approved';
    }

    // The sign-only action is always a confirmation, never an execution, so it keeps the governance
    // label even at threshold where the bundled default reads for the Safe.
    let signLabel = isVeto ? 'veto' : 'approve';

    if (isSuperseded) {
        signLabel = isVeto ? 'vetoAndRequeue' : 'approveAndRequeue';
    }

    let bundleActionKey = isVeto ? 'vetoAndExecute' : 'approveAndExecute';
    const signOnlyActionKey = isVeto ? 'vetoOnly' : 'approveOnly';

    if (isSuperseded) {
        bundleActionKey = isVeto ? 'vetoAndRequeue' : 'approveAndRequeue';
    }

    // Safe-only realities are alerts, not layout. A read problem is the one thing the slot must talk
    // about; while it is active it is the only alert shown, so the read message is never buried under
    // the queue alerts it also invalidates.
    const alerts: IAlert[] = [];

    if (isReadBlocked) {
        alerts.push({
            key: isRateLimited
                ? 'rateLimited'
                : isError
                  ? 'readFailed'
                  : 'stale',
            variant: 'warning',
            message: t(
                `${translationKey}.${isRateLimited ? 'rateLimited' : 'unreachable'}`,
            ),
        });
    } else {
        if (
            thresholdReached &&
            !hasSettled &&
            canStillAffectOutcome &&
            !isQueuedBehindNonce
        ) {
            alerts.push({
                key: 'awaitingExecution',
                variant: 'info',
                message: t(`${translationKey}.awaitingExecution`),
            });
        }

        if (
            !hasSettled &&
            isAdvanceable &&
            canStillAffectOutcome &&
            !thresholdReached
        ) {
            alerts.push({
                key: 'stillCounts',
                variant: 'info',
                message: t(
                    `${translationKey}.${isVeto ? 'stillCountsVeto' : 'stillCounts'}`,
                ),
            });
        }

        if (hasQueuedNonce) {
            alerts.push({
                key: 'nonceQueued',
                variant: 'warning',
                message: t(`${translationKey}.nonceQueued`, {
                    currentNonce: safeInfo?.nonce,
                }),
            });
        }

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
                variant: 'warning',
                message: t(`${translationKey}.replaced`),
            });
        }
    }

    /**
     * The route to the app's own Safe account page, built from the stage alone so it never depends
     * on a Safe read. Offered whenever the app's view of the queue is not authoritative: a report is
     * queued, superseded, or the queue could not be read. Not once settled (the completed button
     * links the executed transaction) and not while rate limited (the account page shares the origin
     * and would 429 too).
     */
    const queuedReportHref =
        isSafeAccountPageEnabled &&
        !hasSettled &&
        !isRateLimited &&
        (pendingReport != null || canRetryRead)
            ? `/safe/${proposal.network}/${externalAddress}`
            : undefined;

    const settledHref =
        settledReport != null
            ? safeAppTransactionUrl({
                  network: proposal.network,
                  address: externalAddress,
                  safeTxHash: settledReport.transaction.safeTxHash,
              })
            : undefined;

    const safeExternalHref =
        (liveReport != null
            ? safeAppTransactionUrl({
                  network: proposal.network,
                  address: externalAddress,
                  safeTxHash: liveReport.transaction.safeTxHash,
              })
            : undefined) ??
        safeAppAccountUrl({
            network: proposal.network,
            address: externalAddress,
        });

    const showAction = !isReadBlocked && (hasSettled || canStillAffectOutcome);
    // An unsigned owner who could execute now gets both the bundled default and a sign-only opt-out;
    // when execution is unavailable they can still add their confirmation on its own.
    const showBundleChoice = canSignNow && canExecuteNow;
    const showSignOnly = canSignNow && !canExecuteNow;
    // Once the stage is advanceable, advancing is the primary action and the Safe's own action
    // becomes optional; a signed or settled body is a completed link, not a call to act.
    const actionVariant =
        hasSettled || isWaitingForOwners || isAdvanceable
            ? 'secondary'
            : 'primary';
    const isActionDisabled = !hasSettled && (isQueuedBehindNonce || isLoading);
    // A signed-and-waiting body links the queued confirmation; a settled one links the executed
    // Safe transaction. Both read as a completed checkmark rather than a button to press.
    const completedLinkProps =
        isWaitingForOwners && queuedReportHref != null
            ? {
                  href: queuedReportHref,
                  target: '_blank',
              }
            : hasSettled && settledHref != null
              ? {
                    href: settledHref,
                    target: '_blank',
                }
              : undefined;
    const invalidateSafeState = async () => {
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
            queryClient.invalidateQueries({
                queryKey: safeServiceKeys.safeTransactionHistory({
                    urlParams,
                }),
            }),
        ]);
    };

    const handleRetry = () => {
        setIsRefreshing(true);
        void invalidateSafeState().finally(() => setIsRefreshing(false));
    };

    const openTransactionDialog = (bundleExecution: boolean) => {
        // Indexing, governance-query invalidation and pending cleanup are the dialog's job; the slot
        // only forwards the Safe-read invalidation it owns.
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
                onSafeStateChange: invalidateSafeState,
            } satisfies ISafeProposalTransactionDialogParams,
        });
    };

    /**
     * Bundling is the default when this confirmation reaches an executable threshold. `Approve only`
     * opts out and leaves the fully-signed transaction in the queue for any owner to execute.
     *
     * Connection and Safe ownership are the standard vote guard's business, so an unconnected or
     * non-owner wallet gets the wallet dialog and then the permission dialog - not a message
     * beside the button.
     */
    const handleVoteClick = (bundleExecution = true) =>
        canSubmitVote
            ? openTransactionDialog(bundleExecution)
            : submitVoteGuard({
                  onSuccess: () => openTransactionDialog(bundleExecution),
              });

    const readDescription = t(
        `${translationKey}.${safeInfo == null ? 'noDataDescription' : 'unreachableDescription'}`,
    );
    return (
        <div className="flex w-full flex-col gap-6">
            {alerts.length > 0 && (
                <div className="-mt-4 flex flex-col gap-3">
                    {alerts.map((alert) =>
                        alert.variant === 'info' ? (
                            <AlertInline
                                key={alert.key}
                                message={alert.message}
                                variant="info"
                            />
                        ) : (
                            <AlertCard
                                key={alert.key}
                                message={alert.message}
                                variant="warning"
                            >
                                {alert.key === 'nonceShared' && (
                                    <p>
                                        {t(
                                            `${translationKey}.nonceSharedDescription`,
                                        )}
                                    </p>
                                )}
                                {alert.key === 'replaced' && (
                                    <p>
                                        {t(
                                            `${translationKey}.replacedDescription`,
                                        )}
                                    </p>
                                )}
                                {alert.key === 'nonceQueued' && (
                                    <p>
                                        {t(
                                            `${translationKey}.${blockerProposalUrl != null ? 'nonceQueuedDescriptionBlocker' : 'nonceQueuedDescription'}`,
                                            {
                                                transactionNonce:
                                                    liveReport?.transaction
                                                        .nonce,
                                            },
                                        )}
                                        {blockerProposalUrl != null && (
                                            <>
                                                {' '}
                                                <Link
                                                    className="text-primary-400 hover:text-primary-600"
                                                    href={blockerProposalUrl}
                                                >
                                                    {blockerProposalSlug}
                                                </Link>
                                                {'.'}
                                            </>
                                        )}
                                    </p>
                                )}
                                {alert.key === 'rateLimited' && (
                                    <p>{readDescription}</p>
                                )}
                                {(alert.key === 'stale' ||
                                    alert.key === 'readFailed') && (
                                    <div className="flex flex-col gap-4">
                                        <p>{readDescription}</p>
                                        {canRetryRead && (
                                            <Button
                                                className="w-fit"
                                                iconLeft={IconType.RELOAD}
                                                isLoading={isRefreshing}
                                                onClick={handleRetry}
                                                size="sm"
                                                variant="warning"
                                            >
                                                {t(`${translationKey}.retry`)}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </AlertCard>
                        ),
                    )}
                </div>
            )}
            {(showAction || queuedReportHref != null) && (
                <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
                    {showAction &&
                        (showBundleChoice ? (
                            <div className="flex w-full gap-2 md:w-fit">
                                <Button
                                    className="w-full md:w-fit"
                                    disabled={isActionDisabled}
                                    onClick={() =>
                                        handleVoteClick(bundleExecution)
                                    }
                                    size="md"
                                    variant={actionVariant}
                                >
                                    {t(
                                        `${translationKey}.${bundleExecution ? bundleActionKey : signOnlyActionKey}`,
                                    )}
                                </Button>
                                <Dropdown.Container
                                    align="end"
                                    constrainContentWidth={false}
                                    customTrigger={
                                        <Button
                                            aria-label={t(
                                                `${translationKey}.moreVotingOptions`,
                                            )}
                                            className="shrink-0"
                                            disabled={isActionDisabled}
                                            iconLeft={IconType.CHEVRON_DOWN}
                                            size="md"
                                            variant={actionVariant}
                                        />
                                    }
                                    disabled={isActionDisabled}
                                >
                                    <Dropdown.Item
                                        aria-checked={bundleExecution}
                                        onSelect={() =>
                                            setBundleExecution(true)
                                        }
                                        role="menuitemradio"
                                        selected={bundleExecution}
                                    >
                                        {t(
                                            `${translationKey}.${bundleActionKey}`,
                                        )}
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        aria-checked={!bundleExecution}
                                        onSelect={() =>
                                            setBundleExecution(false)
                                        }
                                        role="menuitemradio"
                                        selected={!bundleExecution}
                                    >
                                        {t(
                                            `${translationKey}.${signOnlyActionKey}`,
                                        )}
                                    </Dropdown.Item>
                                </Dropdown.Container>
                            </div>
                        ) : showSignOnly ? (
                            <Button
                                className="w-full md:w-fit"
                                disabled={isLoading}
                                onClick={() => handleVoteClick(false)}
                                size="md"
                                variant={actionVariant}
                            >
                                {t(`${translationKey}.${signLabel}`)}
                            </Button>
                        ) : (
                            <Button
                                className="w-full md:w-fit"
                                disabled={
                                    isActionDisabled ||
                                    ((hasSettled || isWaitingForOwners) &&
                                        completedLinkProps == null)
                                }
                                iconLeft={
                                    hasSettled || isWaitingForOwners
                                        ? IconType.CHECKMARK
                                        : undefined
                                }
                                size="md"
                                variant={actionVariant}
                                {...(completedLinkProps ?? {
                                    onClick:
                                        hasSettled || isWaitingForOwners
                                            ? undefined
                                            : () => handleVoteClick(true),
                                })}
                            >
                                {t(`${translationKey}.${buttonKey}`)}
                            </Button>
                        ))}
                    {/* A contextual navigate-away action: one emphasis everywhere, so ghost in every
                        state it appears rather than styled by its neighbour count. */}
                    {queuedReportHref != null && safeExternalHref != null && (
                        <Button
                            className="w-full md:w-fit"
                            href={safeExternalHref}
                            iconRight={IconType.LINK_EXTERNAL}
                            size="md"
                            target="_blank"
                            variant="ghost"
                        >
                            {t(`${translationKey}.viewInAccountQueue`)}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
