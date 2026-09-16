'use client';

import {
    AlertCard,
    addressUtils,
    Button,
    Dropdown,
    IconType,
    Link,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type Hex, numberToHex, pad, toEventSelector } from 'viem';
import { useBytecode } from 'wagmi';
import { getBytecode, getConnection } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { GovernanceServiceKey } from '@/modules/governance/api/governanceService';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { SafeDialogId } from '@/modules/safe/constants';
import {
    SafeExecutionResult,
    useSafeTransactionExecution,
} from '@/modules/safe/hooks/useSafeTransactionExecution';
import { SafeExecutionOutcome } from '@/modules/safe/utils/safeExecutionOutcomeUtils';
import {
    SafeBatchStatus,
    safeTransactionEnvelopeUtils,
} from '@/modules/safe/utils/safeTransactionEnvelopeUtils';
import type { ISppVotingTerminalBodyVoteDefaultProps } from '@/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalBodyVoteDefault';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import {
    type ISafeMultisigTransaction,
    safeService,
    safeServiceKeys,
    useConfirmSafeTransaction,
    useProposeSafeTransaction,
} from '@/shared/api/safeService';
import {
    TransactionType,
    useTransactionStatus,
} from '@/shared/api/transactionService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import {
    safeBodyPluginId,
    safeIndexingPollInterval,
    safeIndexingTimeout,
    safeQueueReadLimit,
} from '../../constants';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';
import { SafeTransactionState } from '../../types';
import { safeMultisigProposalUtils } from '../../utils/safeMultisigProposalUtils';
import { safeMultisigTransactionUtils } from '../../utils/safeMultisigTransactionUtils';

export interface ISafeMultisigSubmitVoteProps
    extends ISppVotingTerminalBodyVoteDefaultProps {}

interface IEip1193Provider {
    request: (args: {
        method: string;
        params?: readonly unknown[] | object;
    }) => Promise<unknown>;
}

const isEip1193Provider = (value: unknown): value is IEip1193Provider =>
    value != null &&
    typeof value === 'object' &&
    'request' in value &&
    typeof value.request === 'function';

const toSafeNonce = (nonce: string): number => {
    const parsedNonce = Number(nonce);

    if (!Number.isSafeInteger(parsedNonce) || parsedNonce < 0) {
        throw new Error('Safe nonce cannot be represented safely');
    }

    return parsedNonce;
};

interface IPreparedReport {
    /**
     * Exact transaction the owner reviewed. For a new report this is the envelope about to be
     * proposed; for a queued one it is the record the service holds.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Whether the transaction still has to be proposed, as opposed to confirmed.
     */
    isNew: boolean;
    /**
     * Whether the transaction sits on the nonce the Safe will execute next, read at prepare time.
     */
    landsOnCurrentNonce: boolean;
    /**
     * Whether execution should follow the signature in the same flow.
     */
    bundleExecution: boolean;
}

const translationKey = 'app.plugins.safeMultisig.safeMultisigSubmitVote';

/**
 * The event the SPP plugin emits when a body result is actually stored. Its presence in the
 * receipt is the only proof the report inside the Safe transaction ran: a Safe emits
 * `ExecutionSuccess` for a payload that did nothing at all - a `DELEGATECALL` to an address with
 * no code returns success, consumes the nonce and records no result. Observed live on sepolia
 * (`0x4c8e665d…`, nonce 6): reviewed, signed and executed correctly, two logs, no report.
 */
const proposalResultReportedTopic = toEventSelector(
    'ProposalResultReported(uint256,uint16,address)',
);

/**
 * What to tell the owner when the Safe ran but the report did not land. Each outcome is a
 * different situation: the nonce survives an outer revert and is gone in the other two, and only
 * one of them leaves anything to wait for.
 */
const executionOutcomeKeys = {
    [SafeExecutionOutcome.OUTER_REVERT]: 'executionReverted',
    [SafeExecutionOutcome.EXECUTION_FAILURE]: 'executionInnerFailed',
    [SafeExecutionOutcome.UNMATCHED]: 'executionUnconfirmed',
} as const;

export const SafeMultisigSubmitVote: React.FC<ISafeMultisigSubmitVoteProps> = (
    props,
) => {
    const { daoId, proposal, externalAddress, stage, isVeto } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const queryClient = useQueryClient();
    const { address: connectedAddress } = useWalletAccount();
    const latestConnectedAddress = useRef(connectedAddress);
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
    const { requiredChainId, withNetworkSwitch } = useNetworkSwitch({
        network: proposal.network,
    });
    const [actionError, setActionError] = useState<string>();
    const [isExecuting, setIsExecuting] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [executedHash, setExecutedHash] = useState<Hex>();
    const [hasIndexingTimedOut, setHasIndexingTimedOut] = useState(false);

    useEffect(() => {
        latestConnectedAddress.current = connectedAddress;
    }, [connectedAddress]);

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

    const { mutateAsync: proposeTransaction } = useProposeSafeTransaction();
    const { mutateAsync: confirmTransaction } = useConfirmSafeTransaction();
    const { execute: executeSafeTransaction } = useSafeTransactionExecution();

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
     * threshold, so the very first click executes.
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
        if (executedHash == null || isReportIndexed) {
            return;
        }

        const timeout = setTimeout(
            () => setHasIndexingTimedOut(true),
            safeIndexingTimeout,
        );

        return () => clearTimeout(timeout);
    }, [executedHash, isReportIndexed]);

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

    const initProtocolKit = async (ownerAddress: string) => {
        const connection = getConnection(wagmiConfig);
        const provider = await connection.connector?.getProvider({
            chainId: requiredChainId,
        });

        if (!isEip1193Provider(provider)) {
            throw new Error('Connected wallet does not expose a provider');
        }

        // Dynamic: the Protocol Kit is only needed once an owner acts, and importing it statically
        // pulls the whole SDK into the proposal page bundle.
        const { default: Safe } = await import('@safe-global/protocol-kit');

        return Safe.init({
            provider,
            signer: ownerAddress,
            safeAddress: externalAddress,
        });
    };

    /**
     * Gas is only charged if execution actually follows: the nonce must be live, the owner must
     * have asked to bundle, and the threshold must be met or about to be. Which note applies then
     * depends on whether a signature is still owed - that is what decides if the wallet opens once
     * or twice.
     */
    const resolveCostNote = (prepared: IPreparedReport) => {
        const { transaction } = prepared;
        const executes =
            prepared.bundleExecution &&
            prepared.landsOnCurrentNonce &&
            (thresholdReached || willCompleteThreshold);

        if (!executes) {
            return 'gasless';
        }

        const signatureStillOwed =
            transaction.confirmations.length <
                transaction.confirmationsRequired &&
            !safeMultisigProposalUtils.hasAddressConfirmed({
                transaction,
                address: latestConnectedAddress.current,
            });

        return signatureStillOwed ? 'bundledExecution' : 'executionOnly';
    };

    /**
     * Opens the account-level review. The narrow approve/veto wording is only claimed when the
     * transaction reports the expected result and nothing else: an extra call, an opposite effect
     * or a stage advance makes the transaction more than this body's verdict, and the owner is sent
     * to the payload instead of a one-line promise.
     *
     * The button carries that too. A payload the app has just described as doing more than
     * reporting the result cannot also be offered as "Approve proposal" - the label is the
     * narrowest authority claim on the screen, and it is the part an owner reads instead of the
     * paragraph above it. Ledger #13: correlation establishes relevance, never authority.
     *
     * Each way of failing that gets its own sentence. "Does more than report this body's result" is
     * true of an extra call in the batch, but it is simply wrong about a report carrying the
     * opposite verdict - which does less than claimed, in the other direction - and it does not
     * name the stage advance a `tryAdvance` report performs. At a consent surface the disclosure
     * has to say which one it is.
     */
    const resolveReviewIntent = (transaction: ISafeMultisigTransaction) => {
        const report = safeMultisigTransactionUtils.findProposalResultReport({
            transaction,
            pluginAddress: proposal.pluginAddress,
            proposalId: proposal.proposalIndex,
            stageId: stage.stageIndex,
        });
        const expectedResult = isVeto
            ? SppProposalType.VETO
            : SppProposalType.APPROVAL;

        if (report == null) {
            return 'unrecognised';
        }

        // Ordered by how badly each one misdescribes the button: an opposite verdict is the wrong
        // vote, an advance is an extra irreversible effect, extra calls are extra effects.
        if (report.resultType !== expectedResult) {
            return 'oppositeResult';
        }

        if (report.tryAdvance) {
            return 'advancesStage';
        }

        // A delegate call carrying report calldata reports nothing: it runs that code in the
        // Safe's own storage context, where it can rewrite owners, threshold and the singleton.
        // The envelope on this path comes from the queue, so `operation` is attacker-chosen input
        // and the narrow label must not survive it (logic map §7.1 - establish the operation, not
        // just the target and effect).
        if (transaction.operation !== 0) {
            return 'delegateCall';
        }

        // Value on a report is an ETH transfer the label does not mention. The queue's `value` is
        // only shape-checked as a string, so anything that is not a plain zero - including a
        // string `BigInt` would throw on - refuses the narrow label rather than parsing it.
        if (transaction.value !== '0') {
            return 'carriesValue';
        }

        if (
            safeTransactionEnvelopeUtils.inspectBatch(transaction.data)
                .status !== SafeBatchStatus.NOT_A_BATCH
        ) {
            return 'batched';
        }

        return 'reportOnly';
    };

    const openReportReview = (prepared: IPreparedReport) => {
        const { transaction } = prepared;
        const intentKey = resolveReviewIntent(transaction);
        const isReportOnly = intentKey === 'reportOnly';

        open(SafeDialogId.TRANSACTION_REVIEW, {
            params: {
                transaction,
                safeAddress: externalAddress,
                network: proposal.network,
                safeVersion: safeInfo?.version ?? null,
                confirmLabel: isReportOnly
                    ? t(`${translationKey}.${isVeto ? 'veto' : 'approve'}`)
                    : t(`${translationKey}.review.mixedConfirm`),
                intent: t(`${translationKey}.review.${intentKey}`, {
                    proposal: proposal.title,
                }),
                /**
                 * The note promises a number of wallet prompts, so it has to be derived from the
                 * same condition the submit path branches on. A transaction that already carries
                 * its signatures is executed with one prompt - telling the owner their confirmation
                 * completes the threshold would describe a step that never happens.
                 */
                costNote: t(
                    `${translationKey}.review.${resolveCostNote(prepared)}`,
                ),
                onConfirm: () =>
                    withNetworkSwitch(
                        () => void submitPreparedReport(prepared),
                    ),
            },
        });
    };

    /**
     * Builds the exact transaction the owner will be asked to authorise, before any consent is
     * given. A new report allocates its nonce here; an existing one is already an envelope.
     *
     * Allocation is an observation, not a reservation: the nonce can be taken while the payload is
     * under review, which `submitPreparedReport` re-checks before spending a signature.
     */
    const prepareReport = async (bundleExecution: boolean) => {
        const ownerAddress = latestConnectedAddress.current;

        if (safeInfo == null || ownerAddress == null) {
            return;
        }

        setActionError(undefined);
        setIsPreparing(true);

        try {
            if (!supportsEip1271Signatures) {
                const ownerBytecode = await getBytecode(wagmiConfig, {
                    address: ownerAddress,
                    chainId: requiredChainId,
                });

                if (ownerBytecode != null) {
                    setActionError(
                        t(`${translationKey}.versionUnsupported`, {
                            version:
                                safeInfo.version ??
                                t(`${translationKey}.unknownVersion`),
                        }),
                    );
                    return;
                }
            }

            if (liveReport != null) {
                /**
                 * An existing report gets the same fresh read a new one does. The polled body
                 * state behind `isExecutableNow` is up to a poll interval old, and the queue it
                 * came from is older still: another owner may have signed, the Safe may have moved
                 * past this nonce, or the transaction may already be gone. Offering execution off
                 * that state spends gas on a guaranteed revert.
                 */
                const [nextNonce, queue] = await Promise.all([
                    safeService.getSafeNextNonce({
                        urlParams: {
                            network: proposal.network,
                            address: externalAddress,
                        },
                    }),
                    safeService.getSafePendingTransactions({
                        urlParams: {
                            network: proposal.network,
                            address: externalAddress,
                        },
                        // One page deep enough to hold any real queue, so absence is normally a
                        // fact rather than a page boundary. `next` still decides whether it is.
                        queryParams: { limit: safeQueueReadLimit },
                    }),
                ]);

                const queuedReport = queue.results.find(
                    (queued: ISafeMultisigTransaction) =>
                        queued.safeTxHash.toLowerCase() ===
                        liveReport.transaction.safeTxHash.toLowerCase(),
                );

                if (queuedReport == null) {
                    /**
                     * Not on the pages read. That is only evidence of absence when the whole queue
                     * was walked - the endpoint takes limit/offset and cannot filter by nonce, so
                     * an unread page is a gap in the read, not a missing transaction. Claiming it
                     * is gone from a partial read is the mistake the history scan already makes
                     * once and does not need repeating here.
                     */
                    setActionError(
                        t(
                            `${translationKey}.${queue.next == null ? 'reportGone' : 'error'}`,
                        ),
                    );
                    // Fired, not awaited: a refetch that fails must not unwind into the catch
                    // below and replace the classified reason with the generic one.
                    void invalidateSafeState();

                    return;
                }

                /**
                 * The Safe consumed this nonce, so no number of signatures can execute it. The
                 * card is still offering execution off the polled state that said otherwise, so
                 * the read that just disproved it is pushed into the cache: the body re-derives
                 * to superseded and offers a re-queue now rather than at the next poll.
                 */
                if (
                    BigInt(nextNonce.currentNonce) > BigInt(queuedReport.nonce)
                ) {
                    setActionError(t(`${translationKey}.replaced`));
                    void invalidateSafeState();

                    return;
                }

                openReportReview({
                    transaction: queuedReport,
                    isNew: false,
                    landsOnCurrentNonce:
                        BigInt(queuedReport.nonce) ===
                        BigInt(nextNonce.currentNonce),
                    bundleExecution,
                });
                return;
            }

            const protocolKit = await initProtocolKit(ownerAddress);

            // Both the live nonce and the queue are read fresh inside the service, uncached: the
            // polled `safeInfo` here may lag, and a stale floor allocates a nonce the Safe has
            // already consumed while a stale queue allocates one another transaction holds.
            const nextNonce = await safeService.getSafeNextNonce({
                urlParams: {
                    network: proposal.network,
                    address: externalAddress,
                },
            });
            const reportData =
                safeMultisigTransactionUtils.buildReportProposalResultData({
                    proposalId: proposal.proposalIndex,
                    stageId: stage.stageIndex,
                    resultType: isVeto
                        ? SppProposalType.VETO
                        : SppProposalType.APPROVAL,
                });
            const safeTransaction = await protocolKit.createTransaction({
                transactions: [
                    {
                        to: proposal.pluginAddress,
                        value: '0',
                        data: reportData,
                    },
                ],
                onlyCalls: true,
                options: { nonce: toSafeNonce(nextNonce.nextNonce) },
            });
            const safeTxHash =
                await protocolKit.getTransactionHash(safeTransaction);

            openReportReview({
                transaction: {
                    ...safeTransaction.data,
                    nonce: safeTransaction.data.nonce.toString(),
                    safeTxHash,
                    from: ownerAddress,
                    confirmations: [],
                    confirmationsRequired: safeInfo.threshold,
                    signatures: null,
                    isExecuted: false,
                    isSuccessful: null,
                    submissionDate: new Date().toISOString(),
                },
                isNew: true,
                /**
                 * The read that allocates also reports the live nonce, so this is the authoritative
                 * answer to whether the new transaction can execute immediately. The polled state
                 * behind `canBundleExecution` may lag it, and paying gas for a guaranteed revert is
                 * worse than deferring execution.
                 */
                landsOnCurrentNonce:
                    BigInt(nextNonce.nextNonce) ===
                    BigInt(nextNonce.currentNonce),
                bundleExecution,
            });
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    safeAddress: externalAddress,
                    proposalId: proposal.id,
                    operation: 'safe_prepare_proposal_result',
                },
            });
            setActionError(t(`${translationKey}.error`));
        } finally {
            setIsPreparing(false);
        }
    };

    /**
     * Signs and submits the payload the owner reviewed — never a rebuilt one. The envelope is
     * reconstructed from the reviewed record and its hash recomputed, so a signature can only ever
     * apply to what was on screen.
     */
    const submitPreparedReport = async (prepared: IPreparedReport) => {
        const ownerAddress = latestConnectedAddress.current;

        if (safeInfo == null || ownerAddress == null) {
            return;
        }

        const { transaction, isNew, bundleExecution } = prepared;

        setActionError(undefined);
        setIsExecuting(true);

        try {
            // Review takes as long as a person takes, on either path. The nonce read is repeated
            // because nothing reserved the reviewed slot in the meantime.
            const nextNonce = await safeService.getSafeNextNonce({
                urlParams: {
                    network: proposal.network,
                    address: externalAddress,
                },
            });

            if (BigInt(nextNonce.currentNonce) > BigInt(transaction.nonce)) {
                // The Safe moved past this nonce: the reviewed transaction can never execute and
                // re-noncing it silently would sign something nobody reviewed.
                setActionError(
                    t(
                        `${translationKey}.${isNew ? 'nonceConsumed' : 'replaced'}`,
                    ),
                );
                return;
            }

            if (
                isNew &&
                BigInt(nextNonce.nextNonce) !== BigInt(transaction.nonce)
            ) {
                // Another transaction now occupies the reviewed nonce. Signing anyway is a
                // deliberate replacement, not something to do on the owner's behalf.
                setActionError(t(`${translationKey}.nonceContested`));
                return;
            }

            /**
             * Recomputed from this read, never carried over from review. An existing report sits
             * at its own nonce rather than at the next free one, so its readiness is whether the
             * Safe has reached that nonce - and that answer can change while the dialog is open.
             */
            const landsOnCurrentNonce =
                BigInt(transaction.nonce) === BigInt(nextNonce.currentNonce);

            const { EthSafeSignature, EthSafeTransaction } = await import(
                '@safe-global/protocol-kit'
            );
            const protocolKit = await initProtocolKit(ownerAddress);

            const envelope =
                safeTransactionEnvelopeUtils.getEnvelope(transaction);
            const safeTransaction = new EthSafeTransaction({
                ...envelope,
                nonce: toSafeNonce(envelope.nonce),
            });
            const safeTxHash =
                await protocolKit.getTransactionHash(safeTransaction);

            if (
                safeTxHash.toLowerCase() !==
                transaction.safeTxHash.toLowerCase()
            ) {
                throw new Error(
                    'Reviewed Safe transaction hash does not match its transaction data',
                );
            }

            const collectedSignatures = transaction.confirmations.map(
                ({ owner, signature, signatureType }) =>
                    new EthSafeSignature(
                        owner,
                        signature,
                        signatureType === 'CONTRACT_SIGNATURE',
                    ),
            );
            let signatures = collectedSignatures;

            const hasEnoughCollectedSignatures =
                collectedSignatures.length >= transaction.confirmationsRequired;
            /**
             * Read from the transaction being submitted, not from the body's pending record. On a
             * re-queue those are different transactions: the owner signed the superseded one, and
             * taking that as having signed this one would build a replacement, ask for consent, and
             * then submit nothing.
             */
            const hasSignedThisTransaction =
                safeMultisigProposalUtils.hasAddressConfirmed({
                    transaction,
                    address: ownerAddress,
                });

            if (!hasEnoughCollectedSignatures && !hasSignedThisTransaction) {
                /**
                 * Sign the EIP-712 `SafeTx` struct, not the bare hash. Both produce a signature the
                 * Safe accepts, but hashing offchain asks the owner to approve an opaque 32-byte
                 * blob, which wallets flag as blind signing. Typed data shows them the target,
                 * value and nonce they are actually authorising.
                 */
                const signature =
                    await protocolKit.signTypedData(safeTransaction);

                if (isNew) {
                    await proposeTransaction({
                        urlParams: {
                            network: proposal.network,
                            address: externalAddress,
                        },
                        body: {
                            safeTransactionData: safeTransaction.data,
                            safeTxHash,
                            senderAddress: ownerAddress,
                            senderSignature: signature.data,
                            origin: 'Aragon',
                        },
                    });
                } else {
                    await confirmTransaction({
                        urlParams: { network: proposal.network, safeTxHash },
                        body: { signature: signature.data },
                    });
                }

                signatures = [...collectedSignatures, signature];
            }

            /**
             * Entered only when the collected set is complete by the service's count. Below that
             * there is nothing wrong - the remaining owners simply have not signed - so the
             * confirmation stands and execution waits, without an error.
             */
            if (
                bundleExecution &&
                landsOnCurrentNonce &&
                signatures.length >= transaction.confirmationsRequired
            ) {
                const report = await executeSafeTransaction({
                    protocolKit,
                    safeTransaction,
                    safeTxHash,
                    safeAddress: externalAddress,
                    chainId: requiredChainId,
                    signatures,
                    /**
                     * The Safe's own event is not enough. It says the Safe ran the payload, not
                     * that the payload did anything, so the report's own event has to be in the
                     * same receipt - emitted by this plugin, for this proposal and this stage.
                     * Without it there is nothing to index, and waiting would spend the whole
                     * timeout to arrive at "the indexer is slow" for a result never recorded.
                     *
                     * This is the governance-specific half of execution and stays here: the shared
                     * hook knows nothing of proposals or stages, and asks the caller instead.
                     */
                    verifyEffect: (receipt) =>
                        receipt.logs.some(
                            (log) =>
                                addressUtils.isAddressEqual(
                                    log.address,
                                    proposal.pluginAddress,
                                ) &&
                                log.topics[0] === proposalResultReportedTopic &&
                                log.topics[1] ===
                                    pad(
                                        numberToHex(
                                            BigInt(proposal.proposalIndex),
                                        ),
                                    ) &&
                                log.topics[2] ===
                                    pad(numberToHex(stage.stageIndex)),
                        ),
                });

                if (report.result === SafeExecutionResult.AUTHORITY_CHANGED) {
                    setActionError(t(`${translationKey}.authorityChanged`));
                    return;
                }

                if (report.result === SafeExecutionResult.REJECTED) {
                    setActionError(t(`${translationKey}.executionRejected`));
                    return;
                }

                if (report.result === SafeExecutionResult.FAILED) {
                    setActionError(
                        t(
                            `${translationKey}.${executionOutcomeKeys[report.outcome]}`,
                        ),
                    );
                } else if (report.result === SafeExecutionResult.EXECUTED) {
                    setExecutedHash(report.hash);
                } else {
                    setActionError(
                        t(`${translationKey}.executionRecordedNothing`),
                    );
                }
            }
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    safeAddress: externalAddress,
                    proposalId: proposal.id,
                    operation: 'safe_report_proposal_result',
                },
            });
            setActionError(t(`${translationKey}.error`));
        } finally {
            /**
             * Refreshed on every exit, not only the successful one. A propose or confirm that the
             * service already accepted is completed work even when the execution after it is
             * rejected or reverts, and leaving the queue showing the pre-signature state makes
             * that work look lost - which invites signing it a second time.
             */
            await invalidateSafeState();
            setIsExecuting(false);
        }
    };

    const prepareIfSupported = (bundleExecution: boolean) => {
        if (hasUnsupportedContractOwner) {
            setActionError(
                t(`${translationKey}.versionUnsupported`, {
                    version:
                        safeInfo?.version ??
                        t(`${translationKey}.unknownVersion`),
                }),
            );
            return;
        }

        // Every path goes through review, including the one whose only remaining act is execution:
        // an owner paying gas for a transaction still gets to see what it does first.
        withNetworkSwitch(() => void prepareReport(bundleExecution));
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
        canSubmitVote
            ? prepareIfSupported(bundleExecution)
            : submitVoteGuard({
                  onSuccess: () => prepareIfSupported(bundleExecution),
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

    if (hasSettled) {
        buttonKey = isVeto ? 'vetoed' : 'approved';
    } else if (isAwaitingIndexing) {
        buttonKey = 'finalizing';
    } else if (thresholdReached) {
        buttonKey = 'executeSafeTransaction';
    } else if (isSuperseded) {
        buttonKey = 'requeueSafeTransaction';
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
     * Two different reasons the numbers may lag, and only one of them is worth a button. An
     * exhausted read budget answers every refetch with the same 429, so offering "Retry" there is
     * a control that provably cannot work - the wait is the remedy, and it is stated instead.
     */
    if (isStale) {
        alerts.push({
            key: 'stale',
            variant: 'warning',
            message: isRateLimited
                ? t(
                      `${translationKey}.${rateLimitedRetryAfter == null ? 'budgetSpent' : 'budgetSpentRetry'}`,
                      { seconds: rateLimitedRetryAfter },
                  )
                : t(`${translationKey}.unreachable`),
        });
    }
    /**
     * W4's handoff: the account queue is where this Safe's nonce sequence is answered, and the
     * proposal must not answer it inline — most of that queue is unrelated traffic, and rendering
     * it here would imply a relationship that does not exist. So the card states what is true of
     * this body's report and offers the route, deep-linked to the same `safeTxHash` it was
     * showing, so one transaction resolves to one review payload on both surfaces.
     *
     * Offered for a report the Safe's nonce sequence can still answer something about - queued
     * behind the nonce, sharing one, or superseded by whatever took it. A superseded report is
     * filtered out of the account queue as permanently dead, and the queue says so on arrival,
     * which is the answer an owner came for. An executed report is the breakdown's provenance
     * links, not a queue lookup.
     */
    const queuedReportHref =
        pendingReport == null ||
        pendingReport.state === SafeTransactionState.EXECUTED
            ? undefined
            : `/safe/${proposal.network}/${externalAddress}?tx=${pendingReport.transaction.safeTxHash}`;

    const isActionDisabled =
        hasSettled ||
        isAwaitingIndexing ||
        isWaitingForOwners ||
        isQueuedBehindNonce ||
        hasUnsupportedContractOwner ||
        isContractOwnerCheckLoading ||
        safeInfo == null;
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
            {(hasSettled ||
                canStillAffectOutcome ||
                queuedReportHref != null) && (
                <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
                    {(hasSettled || canStillAffectOutcome) && (
                        <>
                            {/* Signing and executing are separate acts, so the two routes are peers inside
                        one button rather than a primary with an opt-out: an owner who only wants to
                        authorise can leave the gas to whoever executes. Offered only when execution
                        would actually follow and the card is idle - otherwise there is nothing to
                        choose between. */}
                            {canBundleExecution &&
                            !hasSettled &&
                            !isPreparing &&
                            !isExecuting &&
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
                                        isPreparing ||
                                        isExecuting ||
                                        isAwaitingIndexing
                                    }
                                    onClick={
                                        hasSettled
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
                            {isStale && !isRateLimited && (
                                <Button
                                    className="w-full md:w-fit"
                                    isLoading={isRefreshing}
                                    onClick={() => {
                                        setIsRefreshing(true);
                                        void invalidateSafeState().finally(() =>
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
                        route out of the card. Absent when there is no transaction to see. */}
                    {queuedReportHref != null && (
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
