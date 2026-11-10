'use client';

import { addressUtils, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Hex, isHex } from 'viem';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import {
    type ISafeInfo,
    type ISafeMultisigTransaction,
    SafeServiceKey,
    safeService,
    safeTransactionService,
} from '@/shared/api/safeService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import {
    buildIntentId,
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
import { SafeTransactionReviewContent } from '../../components/safeTransactionReviewContent';
import { SafeDialogId } from '../../constants/safeDialogId';
import {
    SafeSignatureSubmission,
    useSafeOwnerSigning,
} from '../../hooks/useSafeOwnerSigning';
import {
    type ISafeExecutionOutcomeReport,
    isUserRejectionError,
    SafeExecutionPendingError,
    SafeExecutionResult,
    SafeExecutionSubmissionError,
    useSafeTransactionExecution,
} from '../../hooks/useSafeTransactionExecution';
import { SafeApprovalReadiness } from '../../types';
import { SafeExecutionOutcome } from '../../utils/safeExecutionOutcomeUtils';
import { safeProtocolKitUtils } from '../../utils/safeProtocolKitUtils';
import { safeTransactionLookupUtils } from '../../utils/safeTransactionLookupUtils';
import { safeTransactionUtils } from '../../utils/safeTransactionUtils';
import type { ISafeTransactionDialogProps } from './safeTransactionDialog.api';

const translationKey = 'app.safe.safeTransactionDialog';

const intentType = 'safe-transaction-execution';

/**
 * Transaction and Safe state the dialog was opened on, read fresh rather than taken from the caller.
 */
interface IPreparedTransaction {
    /**
     * Transaction to confirm or execute.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * State of the Safe when the transaction was read.
     */
    safeInfo: ISafeInfo;
    /**
     * Whether the transaction can be executed now rather than confirmed.
     */
    canExecute: boolean;
}

type DialogState =
    | 'loading'
    | 'ready'
    | 'signing'
    | 'executing'
    | 'executionPending'
    | 'success'
    | 'uncertain'
    | 'error';

const getErrorMessage = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

const isTransactionHash = (hash: unknown): hash is Hex =>
    isHex(hash) && hash.length === 66;

/**
 * Reviews a queued Safe transaction, then confirms it with the connected owner's signature or executes it once it
 * holds enough confirmations on the Safe's current nonce. Every check runs again against fresh Safe state right before
 * the wallet is asked for anything.
 */
export const SafeTransactionDialog: React.FC<ISafeTransactionDialogProps> = (
    props,
) => {
    const { location } = props;

    invariant(
        location.params != null,
        'SafeTransactionDialog: required parameters must be set.',
    );

    const { network, safeAddress, safeTxHash, onSafeStateChange } =
        location.params;

    const { close, updateOptions } = useDialogContext();
    const { t } = useTranslations();
    const { address: walletAddress } = useWalletAccount();
    const queryClient = useQueryClient();
    const { execute, resume } = useSafeTransactionExecution();
    const { requiredChainId, withNetworkSwitch } = useNetworkSwitch({
        network,
    });
    const { check: checkWalletConnection, result: isWalletConnected } =
        useConnectedWalletGuard();
    const {
        getProtocolKit,
        readOwnerAuthority,
        assertCanSign,
        buildSafeTransaction,
        signAndSubmit,
        recheck,
        hasUncertainSignature,
    } = useSafeOwnerSigning({ network, safeAddress });

    const executionIntentId = useMemo(
        () =>
            buildIntentId({
                type: intentType,
                network,
                safeAddress,
                safeTxHash,
            }),
        [network, safeAddress, safeTxHash],
    );

    const [state, setState] = useState<DialogState>('loading');
    const [prepared, setPrepared] = useState<IPreparedTransaction>();
    const [error, setError] = useState<string>();
    const [isExecuted, setIsExecuted] = useState(false);
    const [isReviewGateBlocked, setIsReviewGateBlocked] = useState(true);

    // A request rejected in the wallet sent nothing, so the dialog goes back to its action rather than to a dead end.
    const returnToReady = useCallback(
        (messageKey: string) => {
            setError(t(`${translationKey}.${messageKey}`));
            setState('ready');
        },
        [t],
    );

    const fail = useCallback(
        (reason: unknown) => {
            setError(getErrorMessage(reason, t(`${translationKey}.failed`)));
            setState('error');
        },
        [t],
    );

    const findTransaction = useCallback(async () => {
        const transaction = await safeTransactionLookupUtils.findTransaction({
            network,
            address: safeAddress,
            safeTxHash,
        });

        if (transaction == null) {
            throw new Error(t(`${translationKey}.transactionUnavailable`));
        }

        return transaction;
    }, [network, safeAddress, safeTxHash, t]);

    /**
     * Reads the owners, threshold and nonce from the chain together with the transaction, and refuses a wallet that is no
     * longer an owner, an invalid threshold or a transaction already executed: the checks both approving and executing
     * run right before the wallet is asked for anything.
     */
    const readSigningContext = useCallback(
        async (owner: string) => {
            const protocolKit = await getProtocolKit(owner);
            const [authority, transaction] = await Promise.all([
                readOwnerAuthority({ protocolKit, owner }),
                findTransaction(),
            ]);

            if (transaction.isExecuted) {
                throw new Error(t(`${translationKey}.alreadyExecuted`));
            }

            return { protocolKit, ...authority, transaction };
        },
        [findTransaction, getProtocolKit, readOwnerAuthority, t],
    );

    const invalidateSafeQueries = useCallback(() => {
        const keys = [
            SafeServiceKey.SAFE_INFO,
            SafeServiceKey.SAFE_PENDING_TRANSACTIONS,
            SafeServiceKey.SAFE_TRANSACTION_HISTORY,
        ];

        void Promise.all(
            keys.map((key) =>
                queryClient.invalidateQueries({ queryKey: [key] }),
            ),
        ).catch(() => undefined);
        onSafeStateChange?.();
    }, [onSafeStateChange, queryClient]);

    const getPendingExecution = useCallback(
        () => pendingTransactionManager.get(executionIntentId),
        [executionIntentId],
    );

    const isExecutionPending = useCallback((): boolean => {
        const status = getPendingExecution()?.status;

        return (
            status === PendingTransactionStatus.PENDING ||
            status === PendingTransactionStatus.SUBMITTED
        );
    }, [getPendingExecution]);

    useEffect(() => {
        if (hasUncertainSignature()) {
            return;
        }

        let isCancelled = false;

        if (getPendingExecution()?.status === PendingTransactionStatus.FAILED) {
            pendingTransactionManager.clear(executionIntentId);
        }

        setState('loading');
        setError(undefined);
        setIsReviewGateBlocked(true);

        const prepare = async (): Promise<IPreparedTransaction> => {
            const [safeInfo, transaction] = await Promise.all([
                safeService.getSafeInfo({
                    urlParams: { network, address: safeAddress },
                }),
                findTransaction(),
            ]);
            const readiness = safeTransactionUtils.getApprovalReadiness({
                currentNonce: safeInfo.nonce,
                owners: safeInfo.owners,
                threshold: safeInfo.threshold,
                transaction,
            });

            return {
                transaction,
                safeInfo,
                canExecute:
                    readiness === SafeApprovalReadiness.READY_TO_EXECUTE,
            };
        };

        prepare()
            .then((value) => {
                if (!isCancelled) {
                    setPrepared(value);
                    setState('ready');
                }
            })
            .catch((reason: unknown) => {
                if (!isCancelled) {
                    fail(reason);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [
        executionIntentId,
        fail,
        findTransaction,
        getPendingExecution,
        hasUncertainSignature,
        network,
        safeAddress,
    ]);

    const markExecutionPending = useCallback(() => {
        setError(t(`${translationKey}.uncertain`));
        setState('executionPending');
    }, [t]);

    const recovery = useMemo(
        () => ({
            type: intentType,
            scope: executionIntentId,
            recovery: { safeAddress, chainId: requiredChainId, safeTxHash },
        }),
        [executionIntentId, requiredChainId, safeAddress, safeTxHash],
    );

    const registerExecutionSubmitted = useCallback(
        (hash: Hex) =>
            pendingTransactionManager.registerSubmitted(
                executionIntentId,
                { hash, chainId: requiredChainId },
                recovery,
            ),
        [executionIntentId, recovery, requiredChainId],
    );

    const finishExecution = useCallback(
        (result: ISafeExecutionOutcomeReport) => {
            if (
                result.result === SafeExecutionResult.FAILED &&
                result.outcome === SafeExecutionOutcome.UNMATCHED
            ) {
                markExecutionPending();
                return;
            }

            pendingTransactionManager.clear(executionIntentId);

            if (result.result === SafeExecutionResult.EXECUTED) {
                invalidateSafeQueries();
                setIsExecuted(true);
                setState('success');
                return;
            }

            const errorKey =
                result.result === SafeExecutionResult.AUTHORITY_CHANGED
                    ? 'executionUnavailable'
                    : 'executionFailed';
            setError(t(`${translationKey}.${errorKey}`));
            setState('error');
        },
        [executionIntentId, invalidateSafeQueries, markExecutionPending, t],
    );

    const handleExecutionError = useCallback(
        (reason: unknown) => {
            if (reason instanceof SafeExecutionPendingError) {
                if (isTransactionHash(reason.hash)) {
                    registerExecutionSubmitted(reason.hash);
                }
                markExecutionPending();
                return;
            }

            if (reason instanceof SafeExecutionSubmissionError) {
                pendingTransactionManager.registerSubmissionUncertain(
                    executionIntentId,
                    { chainId: requiredChainId },
                    recovery,
                );
                markExecutionPending();
                return;
            }

            if (isUserRejectionError(reason)) {
                returnToReady('executionRejected');
                return;
            }

            fail(reason);
        },
        [
            executionIntentId,
            fail,
            markExecutionPending,
            recovery,
            registerExecutionSubmitted,
            requiredChainId,
            returnToReady,
        ],
    );

    /**
     * Follows an execution already sent, from this dialog or before a reload, instead of sending a second one.
     */
    const resumeExecution = useCallback(async () => {
        const pendingExecution = getPendingExecution();
        let hash = pendingExecution?.hash;

        if (hash == null) {
            const transaction = await findTransaction();

            if (
                !transaction.isExecuted ||
                !isTransactionHash(transaction.transactionHash)
            ) {
                markExecutionPending();
                return;
            }

            hash = transaction.transactionHash;
            registerExecutionSubmitted(hash);
        }

        const result = await resume({
            hash,
            safeTxHash,
            safeAddress,
            chainId: requiredChainId,
        });
        finishExecution(result);
    }, [
        findTransaction,
        finishExecution,
        getPendingExecution,
        markExecutionPending,
        registerExecutionSubmitted,
        requiredChainId,
        resume,
        safeAddress,
        safeTxHash,
    ]);

    const handleExecute = useCallback(async () => {
        if (prepared == null || isReviewGateBlocked) {
            return;
        }

        // Following an execution already sent needs no wallet, so it runs before the wallet is required.
        if (isExecutionPending()) {
            setError(undefined);
            setState('executing');

            try {
                await resumeExecution();
            } catch (reason: unknown) {
                handleExecutionError(reason);
            }

            return;
        }

        // Checked before the state changes: returning from 'executing' would leave a dialog that cannot be dismissed.
        if (walletAddress == null || !prepared.canExecute) {
            return;
        }

        setError(undefined);
        setState('executing');

        try {
            const {
                protocolKit,
                owners,
                threshold,
                currentNonce,
                transaction,
            } = await readSigningContext(walletAddress);

            const readiness = safeTransactionUtils.getApprovalReadiness({
                currentNonce: String(currentNonce),
                owners,
                threshold,
                transaction,
            });

            if (readiness !== SafeApprovalReadiness.READY_TO_EXECUTE) {
                throw new Error(t(`${translationKey}.executionUnavailable`));
            }

            const safeTransaction = await buildSafeTransaction({
                protocolKit,
                transaction,
                expectedSafeTxHash: safeTxHash,
            });
            const { EthSafeSignature } = await import(
                '@safe-global/protocol-kit'
            );
            // The confirmations the readiness counted, so a duplicated or removed signer cannot reach the execution.
            const signatures = safeTransactionUtils
                .getCurrentOwnerConfirmations({ transaction, owners })
                .map(
                    ({ owner, signature, signatureType }) =>
                        new EthSafeSignature(
                            owner,
                            signature,
                            signatureType === 'CONTRACT_SIGNATURE',
                        ),
                );

            const result = await execute({
                protocolKit,
                safeTransaction,
                safeTxHash,
                safeAddress,
                chainId: requiredChainId,
                signatures,
                onSubmitted: registerExecutionSubmitted,
                // The wallet sends from whichever account is active, so the owner is checked again right before it.
                beforeSubmit: () => {
                    if (
                        safeProtocolKitUtils.getOwnerConnection(
                            walletAddress,
                            requiredChainId,
                        ) == null
                    ) {
                        throw new Error(t(`${translationKey}.walletRequired`));
                    }
                },
            });
            finishExecution(result);
        } catch (reason: unknown) {
            handleExecutionError(reason);
        }
    }, [
        buildSafeTransaction,
        execute,
        finishExecution,
        handleExecutionError,
        isExecutionPending,
        isReviewGateBlocked,
        prepared,
        readSigningContext,
        registerExecutionSubmitted,
        requiredChainId,
        resumeExecution,
        safeAddress,
        safeTxHash,
        t,
        walletAddress,
    ]);

    const handleConfirm = useCallback(async () => {
        if (prepared == null || walletAddress == null || isReviewGateBlocked) {
            return;
        }

        setError(undefined);
        setState('signing');

        try {
            const [{ protocolKit, owners, currentNonce, transaction }] =
                await Promise.all([
                    readSigningContext(walletAddress),
                    assertCanSign({
                        owner: walletAddress,
                        safeVersion: prepared.safeInfo.version,
                    }),
                ]);

            if (BigInt(transaction.nonce) < BigInt(currentNonce)) {
                throw new Error(t(`${translationKey}.nonceConsumed`));
            }

            const safeTransaction = await buildSafeTransaction({
                protocolKit,
                transaction,
                expectedSafeTxHash: safeTxHash,
            });

            const hasConfirmed = safeTransactionUtils
                .getCurrentOwnerConfirmations({ transaction, owners })
                .some(({ owner }) =>
                    addressUtils.isAddressEqual(owner, walletAddress),
                );

            if (hasConfirmed) {
                invalidateSafeQueries();
                setState('success');
                return;
            }

            const submission = await signAndSubmit({
                protocolKit,
                owner: walletAddress,
                safeTransaction,
                safeTxHash,
                submit: (signature) =>
                    safeTransactionService.confirmSafeTransaction({
                        urlParams: { network, safeTxHash },
                        body: { signature },
                    }),
            });

            if (submission === SafeSignatureSubmission.UNCERTAIN) {
                setError(t(`${translationKey}.uncertain`));
                setState('uncertain');
                return;
            }

            invalidateSafeQueries();
            setState('success');
        } catch (reason: unknown) {
            // A confirmation that may have reached the service stays re-checkable rather than becoming a plain error.
            if (hasUncertainSignature()) {
                setError(
                    getErrorMessage(reason, t(`${translationKey}.uncertain`)),
                );
                setState('uncertain');
                return;
            }

            if (isUserRejectionError(reason)) {
                returnToReady('signatureRejected');
                return;
            }

            fail(reason);
        }
    }, [
        assertCanSign,
        buildSafeTransaction,
        fail,
        hasUncertainSignature,
        invalidateSafeQueries,
        isReviewGateBlocked,
        network,
        prepared,
        readSigningContext,
        returnToReady,
        safeTxHash,
        signAndSubmit,
        t,
        walletAddress,
    ]);

    const handleRecheckConfirmation = () => {
        setError(undefined);
        setState('signing');

        recheck()
            .then((isAccepted) => {
                if (!isAccepted) {
                    setError(t(`${translationKey}.uncertain`));
                    setState('uncertain');
                    return;
                }

                invalidateSafeQueries();
                setState('success');
            })
            .catch((reason: unknown) => {
                setError(
                    getErrorMessage(reason, t(`${translationKey}.uncertain`)),
                );
                setState('uncertain');
            });
    };

    const isDismissBlocked = state === 'signing' || state === 'executing';

    const handleDismiss = useCallback(() => {
        if (!isDismissBlocked) {
            close(SafeDialogId.TRANSACTION);
        }
    }, [close, isDismissBlocked]);

    useEffect(() => {
        updateOptions({ disableOutsideClick: true, onClose: handleDismiss });
    }, [handleDismiss, updateOptions]);

    const handleReadyAction = () => {
        // Following an execution already sent only reads its receipt, so it needs neither a wallet nor a network switch.
        if (isExecutionPending()) {
            void handleExecute();
            return;
        }

        if (!isWalletConnected) {
            checkWalletConnection();
            return;
        }

        // A rejected switch is reported while the dialog stays ready, so the action can be retried.
        withNetworkSwitch(
            () =>
                void (prepared?.canExecute ? handleExecute() : handleConfirm()),
            (switchError: unknown) =>
                setError(
                    isUserRejectionError(switchError)
                        ? t(`${translationKey}.networkSwitchRejected`)
                        : getErrorMessage(
                              switchError,
                              t(`${translationKey}.walletRequired`),
                          ),
                ),
        );
    };

    const readyActionKey = isExecutionPending()
        ? 'recheck'
        : prepared?.canExecute
          ? 'execute'
          : 'confirm';

    const primaryAction =
        state === 'ready'
            ? {
                  label: t(`${translationKey}.actions.${readyActionKey}`),
                  disabled:
                      prepared == null ||
                      isReviewGateBlocked ||
                      (readyActionKey !== 'recheck' &&
                          prepared.transaction.isExecuted),
                  onClick: handleReadyAction,
              }
            : state === 'success'
              ? {
                    label: t(`${translationKey}.actions.done`),
                    onClick: () => close(SafeDialogId.TRANSACTION),
                }
              : state === 'executionPending'
                ? {
                      label: t(`${translationKey}.actions.recheck`),
                      onClick: () => void handleExecute(),
                  }
                : state === 'uncertain'
                  ? {
                        label: t(`${translationKey}.actions.recheck`),
                        onClick: handleRecheckConfirmation,
                    }
                  : state === 'error'
                    ? {
                          label: t(`${translationKey}.actions.close`),
                          onClick: () => close(SafeDialogId.TRANSACTION),
                      }
                    : undefined;

    const statusMessage =
        state === 'loading'
            ? t(`${translationKey}.loading`)
            : state === 'signing'
              ? t(`${translationKey}.signing`)
              : state === 'executing'
                ? t(`${translationKey}.executing`)
                : state === 'success'
                  ? t(
                        `${translationKey}.${isExecuted ? 'executed' : 'confirmed'}`,
                    )
                  : undefined;

    return (
        <>
            <Dialog.Header
                onClose={handleDismiss}
                title={t(`${translationKey}.title`)}
            />
            <Dialog.Content
                className="flex flex-col gap-3 pb-4 md:pb-6"
                description={t(`${translationKey}.description`)}
            >
                {statusMessage != null && (
                    <p className="text-neutral-500">{statusMessage}</p>
                )}
                {error != null && <p className="text-critical-700">{error}</p>}
                {prepared != null && (
                    <SafeTransactionReviewContent
                        network={network}
                        onGateChange={setIsReviewGateBlocked}
                        safeAddress={safeAddress}
                        safeVersion={prepared.safeInfo.version}
                        transaction={prepared.transaction}
                    />
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={primaryAction}
                secondaryAction={{
                    label: t('app.shared.transactionDialog.footer.cancel'),
                    onClick: handleDismiss,
                    disabled: isDismissBlocked,
                }}
            />
        </>
    );
};
