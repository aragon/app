'use client';

import {
    AlertInline,
    addressUtils,
    Button,
    Dropdown,
    IconType,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import type { Hex } from 'viem';
import { useBytecode } from 'wagmi';
import {
    getBytecode,
    getConnection,
    sendTransaction,
    waitForTransactionReceipt,
} from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { GovernanceServiceKey } from '@/modules/governance/api/governanceService';
import type { ISppVotingTerminalBodyVoteDefaultProps } from '@/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalBodyVoteDefault';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import {
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
    SafeMultisigPluginDialogId,
    safeIndexingPollInterval,
    safeIndexingTimeout,
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

const translationKey = 'app.plugins.safeMultisig.safeMultisigSubmitVote';

export const SafeMultisigSubmitVote: React.FC<ISafeMultisigSubmitVoteProps> = (
    props,
) => {
    const { proposal, externalAddress, stage, isVeto } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const queryClient = useQueryClient();
    const { address: connectedAddress } = useWalletAccount();
    const latestConnectedAddress = useRef(connectedAddress);
    const { check: checkWalletConnection } = useConnectedWalletGuard();
    const { requiredChainId, withNetworkSwitch } = useNetworkSwitch({
        network: proposal.network,
    });
    const [actionError, setActionError] = useState<string>();
    const [isExecuting, setIsExecuting] = useState(false);
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
        isExecutableNow,
        isCurrentNonceFree,
        transactionsAhead,
        canStillAffectOutcome,
    } = bodyState;

    const { mutateAsync: proposeTransaction } = useProposeSafeTransaction();
    const { mutateAsync: confirmTransaction } = useConfirmSafeTransaction();

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
        ]);
    };

    const submitReport = async (bundleExecution: boolean) => {
        const ownerAddress = latestConnectedAddress.current;

        if (safeInfo == null || ownerAddress == null) {
            return;
        }

        setActionError(undefined);
        setIsExecuting(true);

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

            const connection = getConnection(wagmiConfig);
            const provider = await connection.connector?.getProvider({
                chainId: requiredChainId,
            });

            if (!isEip1193Provider(provider)) {
                throw new Error('Connected wallet does not expose a provider');
            }

            const {
                default: Safe,
                buildSignatureBytes,
                EthSafeSignature,
                EthSafeTransaction,
            } = await import('@safe-global/protocol-kit');
            const protocolKit = await Safe.init({
                provider,
                signer: ownerAddress,
                safeAddress: externalAddress,
            });

            const resultType = isVeto
                ? SppProposalType.VETO
                : SppProposalType.APPROVAL;
            const reportData =
                safeMultisigTransactionUtils.buildReportProposalResultData({
                    proposalId: proposal.proposalIndex,
                    stageId: stage.stageIndex,
                    resultType,
                });

            let safeTransaction;
            let signatures;
            let confirmationsRequired: number;
            let landsOnCurrentNonce: boolean;

            if (liveReport == null) {
                // Both the live nonce and the queue are read fresh inside the service, uncached:
                // the polled `safeInfo` here may lag, and a stale floor allocates a nonce the Safe
                // has already consumed while a stale queue allocates one another transaction holds.
                const nextNonce = await safeService.getSafeNextNonce({
                    urlParams: {
                        network: proposal.network,
                        address: externalAddress,
                    },
                });

                /**
                 * The read that allocates also reports the live nonce, so this is the authoritative
                 * answer to whether the new transaction can execute immediately. The polled state
                 * behind `canBundleExecution` may lag it, and paying gas for a guaranteed revert is
                 * worse than deferring execution.
                 */
                landsOnCurrentNonce =
                    BigInt(nextNonce.nextNonce) ===
                    BigInt(nextNonce.currentNonce);

                safeTransaction = await protocolKit.createTransaction({
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
                /**
                 * Sign the EIP-712 `SafeTx` struct, not the bare hash. Both produce a signature the
                 * Safe accepts, but hashing offchain asks the owner to approve an opaque 32-byte
                 * blob, which wallets flag as blind signing. Typed data shows them the target, value
                 * and nonce they are actually authorising.
                 */
                const signature =
                    await protocolKit.signTypedData(safeTransaction);

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

                signatures = [signature];
                confirmationsRequired = safeInfo.threshold;
            } else {
                const { transaction } = liveReport;
                safeTransaction = new EthSafeTransaction({
                    to: transaction.to,
                    value: transaction.value,
                    data: transaction.data ?? '0x',
                    operation: transaction.operation,
                    safeTxGas: transaction.safeTxGas,
                    baseGas: transaction.baseGas,
                    gasPrice: transaction.gasPrice,
                    gasToken: transaction.gasToken,
                    refundReceiver: transaction.refundReceiver,
                    nonce: toSafeNonce(transaction.nonce),
                });
                const safeTxHash =
                    await protocolKit.getTransactionHash(safeTransaction);

                if (
                    safeTxHash.toLowerCase() !==
                    transaction.safeTxHash.toLowerCase()
                ) {
                    throw new Error(
                        'Queued Safe transaction hash does not match its transaction data',
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

                const hasEnoughCollectedSignatures =
                    collectedSignatures.length >=
                    transaction.confirmationsRequired;

                if (hasEnoughCollectedSignatures || hasConnectedWalletSigned) {
                    signatures = collectedSignatures;
                } else {
                    const signature =
                        await protocolKit.signTypedData(safeTransaction);
                    await confirmTransaction({
                        urlParams: {
                            network: proposal.network,
                            safeTxHash,
                        },
                        body: { signature: signature.data },
                    });
                    signatures = [...collectedSignatures, signature];
                }

                confirmationsRequired = transaction.confirmationsRequired;
                landsOnCurrentNonce = isExecutableNow;
            }

            if (
                bundleExecution &&
                landsOnCurrentNonce &&
                signatures.length >= confirmationsRequired
            ) {
                for (const signature of signatures) {
                    safeTransaction.addSignature(signature);
                }

                const signatureBytes = buildSignatureBytes(signatures);

                if (safeTransaction.encodedSignatures() !== signatureBytes) {
                    throw new Error(
                        'Protocol Kit produced inconsistent Safe signature bytes',
                    );
                }

                const data =
                    await protocolKit.getEncodedTransaction(safeTransaction);
                const hash = await sendTransaction(wagmiConfig, {
                    chainId: requiredChainId,
                    to: externalAddress as Hex,
                    data: data as Hex,
                    value: BigInt(0),
                });
                await waitForTransactionReceipt(wagmiConfig, { hash });
                setExecutedHash(hash);
            }

            await invalidateSafeState();
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
            setIsExecuting(false);
        }
    };

    const checkOwnershipAndSubmit = (bundleExecution: boolean) => {
        const ownerAddress = latestConnectedAddress.current;
        const isOwner =
            ownerAddress != null &&
            safeInfo?.owners.some((owner) =>
                addressUtils.isAddressEqual(owner, ownerAddress),
            ) === true;

        if (!isOwner) {
            setActionError(t(`${translationKey}.ownerRequired`));
            return;
        }

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

        const runSubmit = () =>
            withNetworkSwitch(() => void submitReport(bundleExecution));

        // Executing is an onchain transaction the wallet already prices and describes. Only the
        // offchain signature gets the confirmation step, whose whole claim is that it costs nothing.
        if (thresholdReached) {
            runSubmit();
            return;
        }

        open(SafeMultisigPluginDialogId.CONFIRM_SIGNATURE, {
            params: {
                proposalTitle: proposal.title,
                safeAddress: externalAddress,
                signerAddress: ownerAddress,
                network: proposal.network,
                isVeto,
                nonce: liveReport?.transaction.nonce,
                willExecute: canBundleExecution && bundleExecution,
                onConfirm: runSubmit,
            },
        });
    };

    /**
     * Bundling is the default: when the confirmation completes the threshold there is nothing left
     * to wait for, so executing in the same flow saves a second visit. `Approve only` opts out and
     * leaves the fully-signed transaction in the queue for any owner to execute.
     */
    const handleVoteClick = (bundleExecution = true) =>
        checkWalletConnection({
            onSuccess: () => checkOwnershipAndSubmit(bundleExecution),
        });

    const isSuperseded =
        pendingReport?.state === SafeTransactionState.SUPERSEDED;
    const isWaitingForOwners =
        liveReport != null && hasConnectedWalletSigned && !thresholdReached;

    /**
     * A signature binds one exact nonce, so a fully-signed report cannot execute until the
     * transactions ahead of it clear - and it cannot be moved: re-nonced calldata is a different
     * transaction hash, which voids every signature collected so far.
     *
     * What is ahead is deliberately not described. A Safe is a universal account and its queue is
     * shared with every other application using it, so the blocker may be unrelated to Aragon and
     * unknowable here. Owners settle priority in the Safe itself.
     */
    const isQueuedBehindNonce = thresholdReached && transactionsAhead > 0;

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
     * The two surprising states, stated rather than left to be inferred from a rejected header
     * sitting above a live action.
     *
     * A Safe transaction never expires and a verdict has no deadline, so while the stage can still
     * advance the owners can still act and it still counts. Once `maxAdvance` has passed the stage
     * can never advance: the transaction remains executable in the Safe forever, but it can no
     * longer move this proposal.
     */
    const stageEndDate = sppStageUtils.getStageEndDate(proposal, stage);
    const hasWindowClosed =
        stageEndDate != null && DateTime.now() > stageEndDate;

    if (!hasSettled && hasWindowClosed && canStillAffectOutcome) {
        alerts.push({
            key: 'windowClosed',
            variant: 'info',
            message: t(`${translationKey}.windowClosed`),
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

    if (isQueuedBehindNonce) {
        alerts.push({
            key: 'nonceQueued',
            variant: 'warning',
            message: t(`${translationKey}.nonceQueued`, {
                count: transactionsAhead,
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

    if (isStale) {
        alerts.push({
            key: 'stale',
            variant: 'warning',
            message: t(`${translationKey}.unreachable`),
        });
    }

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
                <AlertInline
                    key={alert.key}
                    message={alert.message}
                    variant={alert.variant}
                />
            ))}
            {/* Nothing to offer once the stage can never advance: acting would change nothing, and
                a disabled action beside an expired stage only invites the question. */}
            {(hasSettled || canStillAffectOutcome) && (
                <div className="flex flex-col gap-3 md:flex-row">
                    <Button
                        className="w-full md:w-fit"
                        disabled={isActionDisabled}
                        iconLeft={hasSettled ? IconType.CHECKMARK : undefined}
                        isLoading={isExecuting || isAwaitingIndexing}
                        onClick={
                            hasSettled ? undefined : () => handleVoteClick(true)
                        }
                        size="md"
                        variant={hasSettled ? 'secondary' : 'primary'}
                    >
                        {t(`${translationKey}.${buttonKey}`)}
                    </Button>
                    {/* Bundling is a convenience, not a requirement: the signature and the
                        execution are separate acts, so an owner who only wants to authorise can
                        leave the gas to whoever executes. Offered only when execution would
                        actually follow - otherwise there is nothing to opt out of. */}
                    {canBundleExecution && (
                        <Dropdown.Container
                            align="end"
                            constrainContentWidth={false}
                            customTrigger={
                                <Button
                                    aria-label={t(
                                        `${translationKey}.moreActions`,
                                    )}
                                    disabled={isActionDisabled}
                                    iconLeft={IconType.CHEVRON_DOWN}
                                    size="md"
                                    variant="primary"
                                />
                            }
                        >
                            <Dropdown.Item
                                onClick={() => handleVoteClick(false)}
                            >
                                {t(
                                    `${translationKey}.${isVeto ? 'vetoOnly' : 'approveOnly'}`,
                                )}
                            </Dropdown.Item>
                        </Dropdown.Container>
                    )}
                    {isStale && (
                        <Button
                            className="w-full md:w-fit"
                            onClick={() => void invalidateSafeState()}
                            size="md"
                            variant="tertiary"
                        >
                            {t(`${translationKey}.retry`)}
                        </Button>
                    )}
                </div>
            )}
            {!hasSettled && helperText != null && (
                <p className="text-center font-normal text-neutral-500 text-sm leading-normal md:text-left">
                    {helperText}
                </p>
            )}
            {actionError != null && (
                <p className="text-center text-critical-500 text-sm md:text-left">
                    {actionError}
                </p>
            )}
        </div>
    );
};
