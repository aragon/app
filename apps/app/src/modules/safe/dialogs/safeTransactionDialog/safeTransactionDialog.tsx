'use client';

import { addressUtils, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type Hex, isHex } from 'viem';
import { getBytecode, getConnection } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import {
    type ISafeInfo,
    type ISafeMultisigTransaction,
    SafeServiceError,
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
    type ISafeExecutionOutcomeReport,
    isUserRejectionError,
    SafeExecutionPendingError,
    SafeExecutionResult,
    SafeExecutionSubmissionError,
    useSafeTransactionExecution,
} from '../../hooks/useSafeTransactionExecution';
import { SafeApprovalReadiness } from '../../types';
import { SafeExecutionOutcome } from '../../utils/safeExecutionOutcomeUtils';
import { safeTransactionEnvelopeUtils } from '../../utils/safeTransactionEnvelopeUtils';
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

/**
 * Confirmation whose submission to the Safe transaction service returned no definitive answer.
 */
interface IUncertainConfirmation {
    /**
     * Owner that signed the transaction.
     */
    owner: string;
    /**
     * Hash of the signed transaction.
     */
    safeTxHash: string;
    /**
     * Signature submitted to the service.
     */
    signature: string;
}

const getErrorMessage = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

const isSameHash = (a: string, b: string): boolean =>
    a.toLowerCase() === b.toLowerCase();

const isTransactionHash = (hash: unknown): hash is Hex =>
    isHex(hash) && hash.length === 66;

// Matches the exact signature submitted, not any confirmation of the owner: only that proves the uncertain write landed.
const hasSubmittedConfirmation = (
    transaction: ISafeMultisigTransaction,
    submitted: IUncertainConfirmation,
): boolean =>
    transaction.confirmations.some(
        (confirmation) =>
            addressUtils.isAddressEqual(confirmation.owner, submitted.owner) &&
            isSameHash(confirmation.signature, submitted.signature),
    );

const hasValidThreshold = (threshold: number, owners: string[]): boolean =>
    threshold >= 1 && threshold <= owners.length;

/**
 * Returns the wallet connection when it is the given owner on the given chain, undefined otherwise.
 */
const getOwnerConnection = (owner: string, chainId: number) => {
    const connection = getConnection(wagmiConfig);

    return connection.status === 'connected' &&
        addressUtils.isAddressEqual(connection.address, owner) &&
        connection.chainId === chainId
        ? connection
        : undefined;
};

// A 4xx answer is the service refusing the confirmation; a timeout or a conflict may hide an accepted one.
const isDefinitiveWriteError = (error: unknown): boolean =>
    error instanceof SafeServiceError &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 408 &&
    error.status !== 409;

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
    const [uncertainConfirmation, setUncertainConfirmation] =
        useState<IUncertainConfirmation>();
    const uncertainConfirmationRef = useRef<IUncertainConfirmation>(undefined);

    const updateUncertainConfirmation = useCallback(
        (confirmation?: IUncertainConfirmation) => {
            uncertainConfirmationRef.current = confirmation;
            setUncertainConfirmation(confirmation);
        },
        [],
    );

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

    const getProtocolKit = useCallback(
        async (owner: string) => {
            const connection = getOwnerConnection(owner, requiredChainId);

            if (typeof connection?.connector.getProvider !== 'function') {
                throw new Error(t(`${translationKey}.walletRequired`));
            }

            const provider = await connection.connector.getProvider({
                chainId: requiredChainId,
            });

            if (
                provider == null ||
                typeof provider !== 'object' ||
                !('request' in provider) ||
                typeof provider.request !== 'function'
            ) {
                throw new Error(t(`${translationKey}.providerUnavailable`));
            }

            const { default: Safe } = await import('@safe-global/protocol-kit');
            const { request } = provider;

            return Safe.init({
                provider: {
                    request: async (args) => await request.call(provider, args),
                },
                signer: owner,
                safeAddress,
            });
        },
        [requiredChainId, safeAddress, t],
    );

    /**
     * Rebuilds the protocol-kit transaction from the service fields and checks it hashes to the reviewed transaction:
     * signing or executing fields that hash to anything else would authorise something that was never reviewed.
     */
    const buildSafeTransaction = useCallback(
        async (
            protocolKit: Awaited<ReturnType<typeof getProtocolKit>>,
            transaction: ISafeMultisigTransaction,
        ) => {
            const { EthSafeTransaction } = await import(
                '@safe-global/protocol-kit'
            );
            const envelope =
                safeTransactionEnvelopeUtils.getEnvelope(transaction);
            const safeTransaction = new EthSafeTransaction({
                ...envelope,
                nonce: Number(envelope.nonce),
            });
            const computedHash = (await protocolKit.getTransactionHash(
                safeTransaction,
            )) as Hex;

            if (
                !isSameHash(computedHash, safeTxHash) ||
                !isSameHash(transaction.safeTxHash, safeTxHash)
            ) {
                throw new Error(t(`${translationKey}.hashMismatch`));
            }

            return safeTransaction;
        },
        [safeTxHash, t],
    );

    const reconcileConfirmation = useCallback(
        async (confirmation: IUncertainConfirmation) =>
            hasSubmittedConfirmation(await findTransaction(), confirmation),
        [findTransaction],
    );

    /**
     * Reads the owners, threshold and nonce from the chain together with the transaction, and refuses a wallet that is no
     * longer an owner, an invalid threshold or a transaction already executed: the checks both approving and executing
     * run right before the wallet is asked for anything.
     */
    const readOwnerAuthority = useCallback(
        async (owner: string) => {
            const protocolKit = await getProtocolKit(owner);
            const [owners, threshold, currentNonce, transaction] =
                await Promise.all([
                    protocolKit.getOwners(),
                    protocolKit.getThreshold(),
                    protocolKit.getNonce(),
                    findTransaction(),
                ]);

            if (
                !owners.some((safeOwner) =>
                    addressUtils.isAddressEqual(safeOwner, owner),
                )
            ) {
                throw new Error(t(`${translationKey}.notOwner`));
            }

            if (!hasValidThreshold(threshold, owners)) {
                throw new Error(t(`${translationKey}.invalidThreshold`));
            }

            if (transaction.isExecuted) {
                throw new Error(t(`${translationKey}.alreadyExecuted`));
            }

            return {
                protocolKit,
                owners,
                threshold,
                currentNonce,
                transaction,
            };
        },
        [findTransaction, getProtocolKit, t],
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
        if (uncertainConfirmationRef.current != null) {
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
            } = await readOwnerAuthority(walletAddress);

            const readiness = safeTransactionUtils.getApprovalReadiness({
                currentNonce: String(currentNonce),
                owners,
                threshold,
                transaction,
            });

            if (readiness !== SafeApprovalReadiness.READY_TO_EXECUTE) {
                throw new Error(t(`${translationKey}.executionUnavailable`));
            }

            const safeTransaction = await buildSafeTransaction(
                protocolKit,
                transaction,
            );
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
                        getOwnerConnection(walletAddress, requiredChainId) ==
                        null
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
        readOwnerAuthority,
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
            const { protocolKit, owners, currentNonce, transaction } =
                await readOwnerAuthority(walletAddress);

            // Safes older than v1.3.0 cannot verify the signature of a contract owner.
            if (
                !safeTransactionUtils.supportsEip1271Signatures(
                    prepared.safeInfo.version,
                )
            ) {
                const ownerBytecode = await getBytecode(wagmiConfig, {
                    address: walletAddress as Hex,
                    chainId: requiredChainId,
                });

                if (ownerBytecode != null) {
                    throw new Error(
                        t(`${translationKey}.unsupportedContractOwner`),
                    );
                }
            }

            if (BigInt(transaction.nonce) < BigInt(currentNonce)) {
                throw new Error(t(`${translationKey}.nonceConsumed`));
            }

            const safeTransaction = await buildSafeTransaction(
                protocolKit,
                transaction,
            );

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

            const signature = await protocolKit.signTypedData(safeTransaction);

            // The wallet signs with whichever account is active, so a switch during the prompt yields a signature of
            // another account, which reconciliation would then look for under the wrong owner.
            if (getOwnerConnection(walletAddress, requiredChainId) == null) {
                throw new Error(t(`${translationKey}.walletRequired`));
            }

            const confirmation: IUncertainConfirmation = {
                owner: walletAddress,
                safeTxHash,
                signature: signature.data,
            };

            try {
                await safeTransactionService.confirmSafeTransaction({
                    urlParams: { network, safeTxHash },
                    body: { signature: signature.data },
                });
            } catch (writeError: unknown) {
                if (isDefinitiveWriteError(writeError)) {
                    throw writeError;
                }

                updateUncertainConfirmation(confirmation);
                setState('uncertain');

                if (await reconcileConfirmation(confirmation)) {
                    updateUncertainConfirmation(undefined);
                    invalidateSafeQueries();
                    setState('success');
                    return;
                }

                setError(t(`${translationKey}.uncertain`));
                return;
            }

            invalidateSafeQueries();
            setState('success');
        } catch (reason: unknown) {
            // A confirmation that may have reached the service stays re-checkable rather than becoming a plain error.
            if (uncertainConfirmationRef.current != null) {
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
        buildSafeTransaction,
        fail,
        invalidateSafeQueries,
        isReviewGateBlocked,
        network,
        prepared,
        readOwnerAuthority,
        reconcileConfirmation,
        requiredChainId,
        returnToReady,
        safeTxHash,
        t,
        updateUncertainConfirmation,
        walletAddress,
    ]);

    const handleRecheckConfirmation = () => {
        if (uncertainConfirmation == null) {
            return;
        }

        setError(undefined);
        setState('signing');

        reconcileConfirmation(uncertainConfirmation)
            .then((isAccepted) => {
                if (!isAccepted) {
                    setError(t(`${translationKey}.uncertain`));
                    setState('uncertain');
                    return;
                }

                updateUncertainConfirmation(undefined);
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
    // The primary action of these states already closes the dialog, so a second close button would duplicate it.
    const hasDismissAction = state !== 'success' && state !== 'error';

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
                secondaryAction={
                    hasDismissAction
                        ? {
                              label: t(
                                  'app.shared.transactionDialog.footer.cancel',
                              ),
                              onClick: handleDismiss,
                              disabled: isDismissBlocked,
                          }
                        : undefined
                }
            />
        </>
    );
};
