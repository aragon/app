import {
    AlertCard,
    ChainEntityType,
    Dialog,
    IconType,
} from '@aragon/gov-ui-kit';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import { useTransactionStatus } from '@/shared/api/transactionService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { buildIntentId } from '@/shared/utils/pendingTransactionManager';
import { NetworkSwitchAlert } from '../networkSwitchAlert';
import {
    type ITransactionStatusStepMetaAddon,
    TransactionStatus,
    type TransactionStatusState,
} from '../transactionStatus';
import { useTranslations } from '../translationsProvider';
import {
    type ITransactionDialogProps,
    TransactionDialogStep,
} from './transactionDialog.api';
import { TransactionDialogFooter } from './transactionDialogFooter';
import { transactionDialogUtils } from './transactionDialogUtils';
import { useManagedTransaction } from './useManagedTransaction';

const indexingStepInterval = 1000;

// How long a broadcast transaction may stay unconfirmed before the confirm step surfaces a warning.
// Generous enough that a slow (but eventually mined) inclusion never false-positives — wallet-priced
// transactions land within a few blocks even under congestion — while bounding the "stuck in the
// mempool" spinner. Receipt polling never stops: a late receipt still completes the dialog.
const confirmStepTimeout = 300_000;

export const TransactionDialog = <TCustomStepId extends string>(
    props: ITransactionDialogProps<TCustomStepId>,
) => {
    const {
        title,
        description,
        intent,
        customSteps,
        transactionInfo,
        stepper,
        submitLabel,
        successLink,
        children,
        prepareTransaction,
        onCancelClick,
        onSuccess,
        onIndexed,
        network = Network.ETHEREUM_MAINNET,
        transactionType,
        indexingFallbackUrl,
        disableCancel,
    } = props;

    const {
        activeStep,
        steps,
        activeStepIndex,
        nextStep,
        updateActiveStep,
        updateSteps,
    } = stepper;
    const activeStepInfo =
        activeStep != null ? steps[activeStepIndex] : undefined;

    const { t } = useTranslations();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const { open, updateOptions } = useDialogContext();

    // Make the onSuccess property stable to only trigger it once on transaction success
    const onSuccessRef = useRef(onSuccess);

    // Guard so onIndexed fires exactly once: react-query polling yields new status-object
    // identities on re-render, so without this the indexed effect would refire.
    const onIndexedFiredRef = useRef(false);

    const { address } = useWalletAccount();
    const { buildEntityUrl } = useDaoChain({ network });
    const {
        requiredChainId,
        isCrossNetworkTransaction,
        networkName: transactionNetworkName,
        switchChainStatus,
        withNetworkSwitch,
    } = useNetworkSwitch({ network });

    const handleTransactionError = useCallback(
        (stepId?: string) =>
            (error: unknown, context?: Record<string, unknown>) =>
                transactionDialogUtils.monitorTransactionError(error, {
                    stepId,
                    from: address,
                    ...context,
                }),
        [address],
    );

    const {
        mutate: prepareTransactionMutate,
        status: prepareTransactionStatus,
        data: transaction,
    } = useMutation({ mutationFn: prepareTransaction, onSuccess: nextStep });

    // Resume identity: explicit `intent.id` when the calldata is non-deterministic (e.g. proposals),
    // otherwise derived from the prepared transaction, which is stable for the same action.
    const intentId = useMemo(
        () =>
            intent?.id ??
            (transaction != null && address != null
                ? buildIntentId({
                      from: address,
                      chainId: requiredChainId,
                      to: transaction.to,
                      data: transaction.data,
                      value: transaction.value,
                  })
                : undefined),
        [intent?.id, transaction, address, requiredChainId],
    );

    // Stored with the pending transaction so duplicate detection can scope by type + context. Left
    // undefined when there is nothing to scope by (e.g. inline transactions).
    const transactionMeta = useMemo(
        () =>
            transactionType != null || intent?.scope != null
                ? { type: transactionType, scope: intent?.scope }
                : undefined,
        [transactionType, intent?.scope],
    );
    const {
        approveState,
        hash,
        submittedAt,
        sendError,
        resumeTarget,
        receipt,
        send,
        resend,
        reset,
    } = useManagedTransaction(intentId, transactionMeta, requiredChainId);
    const {
        data: txReceipt,
        status: waitTxStatus,
        fetchStatus: waitTxFetchStatus,
        error: waitTxError,
    } = receipt;

    // Flips once the transaction has been unconfirmed for longer than the confirm-step timeout,
    // computed from the broadcast timestamp so a resumed long-stuck transaction warns immediately.
    // A new hash (fresh attempt) resets the flag and starts a new window.
    const [isConfirmTimedOut, setIsConfirmTimedOut] = useState(false);
    const isAwaitingConfirmation =
        hash != null &&
        waitTxStatus === 'pending' &&
        waitTxFetchStatus === 'fetching';

    useEffect(() => {
        if (!isAwaitingConfirmation) {
            setIsConfirmTimedOut(false);
            return;
        }
        const elapsed = Date.now() - (submittedAt ?? Date.now());
        const timer = setTimeout(
            () => setIsConfirmTimedOut(true),
            Math.max(confirmStepTimeout - elapsed, 0),
        );

        return () => clearTimeout(timer);
    }, [isAwaitingConfirmation, submittedAt]);

    // Stuck-transaction frequency is a signal worth watching (e.g. chain RPCs accepting underpriced
    // transactions) — log the timeout so it is visible in monitoring.
    useEffect(() => {
        if (!isConfirmTimedOut) {
            return;
        }
        monitoringUtils.logMessage(
            'transactionDialog: transaction confirmation timed out',
            {
                level: 'warning',
                context: { hash, chainId: requiredChainId, transactionType },
            },
        );
    }, [isConfirmTimedOut, hash, requiredChainId, transactionType]);

    const isIndexing = activeStep === TransactionDialogStep.INDEXING;

    // Using the `!` operator here as this hook is only enabled when the hash and transactionType are defined
    const indexingUrlParams = { network, transactionHash: hash! };
    const indexingParams = {
        urlParams: indexingUrlParams,
        queryParams: { type: transactionType! },
    };
    const { data: transactionStatus } = useTransactionStatus(indexingParams, {
        enabled: waitTxStatus === 'success' && isIndexing,
        refetchInterval: ({ state }) =>
            state.data?.isProcessed ? false : indexingStepInterval,
    });

    // Fire onIndexed exactly once when the backend reports the transaction as indexed. The
    // fired-ref guard makes re-renders and callback identity changes no-ops after the first call.
    const isTransactionIndexed = transactionStatus?.isProcessed === true;
    const indexedProposalSlug = transactionStatus?.slug;

    useEffect(() => {
        if (!isTransactionIndexed || onIndexedFiredRef.current) {
            return;
        }

        onIndexedFiredRef.current = true;
        onIndexed?.({ slug: indexedProposalSlug });
    }, [isTransactionIndexed, indexedProposalSlug, onIndexed]);

    const handleSendTransaction = useCallback(() => {
        const onError = handleTransactionError(TransactionDialogStep.APPROVE);

        // No prepared transaction = a resumed dialog that skipped prepare: re-send the stored
        // request, or surface a failure if there is none (e.g. lost after a reload).
        if (transaction == null) {
            if (!resend()) {
                onError(
                    new Error(
                        'TransactionDialog: no prepared transaction and nothing to re-send.',
                    ),
                );
            }
            return;
        }

        // With a prepared transaction the id is always derivable; a missing one means no connection.
        if (intentId == null) {
            onError(
                new Error(
                    'TransactionDialog: cannot identify the action to send (wallet not connected).',
                ),
            );
            return;
        }

        // Pin to the required chain so wagmi rejects instead of silently signing on the wrong one.
        send({ ...transaction, chainId: requiredChainId });
    }, [
        transaction,
        intentId,
        requiredChainId,
        send,
        resend,
        handleTransactionError,
    ]);

    const handleRetryTransaction = useCallback(() => {
        if (transaction != null) {
            updateActiveStep(TransactionDialogStep.APPROVE);
            handleSendTransaction();
            return;
        }
        if (resend()) {
            updateActiveStep(TransactionDialogStep.APPROVE);
            return;
        }
        // A reload-resumed dialog has neither a prepared transaction nor a stored request to
        // re-send: discard the stale record and restart the flow so PREPARE rebuilds the request.
        reset();
        updateActiveStep(TransactionDialogStep.PREPARE);
    }, [transaction, resend, reset, updateActiveStep, handleSendTransaction]);

    // Re-sending while the previous transaction may still be mined risks executing the action twice —
    // gate the retry behind an explicit confirmation (mirrors the duplicate-proposal override).
    const handleConfirmStepAction = useCallback(() => {
        if (isConfirmTimedOut) {
            open(ApplicationDialogId.RETRY_TRANSACTION_WARNING, {
                params: { onRetry: handleRetryTransaction },
                stack: true,
            });
            return;
        }
        handleRetryTransaction();
    }, [isConfirmTimedOut, open, handleRetryTransaction]);

    const approveStepAction = useCallback(
        () => withNetworkSwitch(handleSendTransaction),
        [withNetworkSwitch, handleSendTransaction],
    );
    const transactionStepActions: Record<TransactionDialogStep, () => void> =
        useMemo(
            () => ({
                [TransactionDialogStep.PREPARE]: prepareTransactionMutate,
                [TransactionDialogStep.APPROVE]: approveStepAction,
                [TransactionDialogStep.CONFIRM]: handleConfirmStepAction,
                [TransactionDialogStep.INDEXING]: () => {
                    // noOp needed as react query will refetch the transaction status
                },
            }),
            [
                prepareTransactionMutate,
                approveStepAction,
                handleConfirmStepAction,
            ],
        );

    // Let a managed send win over the chain-switch state: a resumed pending/submitted action must not
    // look idle (which would invite a duplicate re-send) just because the wallet is on another chain.
    const approveStepStatus =
        isCrossNetworkTransaction && approveState === 'idle'
            ? switchChainStatus
            : approveState;
    const indexingStepStatus = transactionStatus?.isProcessed
        ? 'success'
        : isIndexing
          ? 'pending'
          : 'idle';
    // A long-unconfirmed transaction surfaces as a warning (possibly stuck) instead of an endless
    // spinner; a receipt result arriving later still wins over the timeout.
    const confirmQueryStatus = transactionDialogUtils.queryToStepState(
        waitTxStatus,
        waitTxFetchStatus,
    );
    const confirmStepStatus =
        isConfirmTimedOut && confirmQueryStatus === 'pending'
            ? 'warning'
            : confirmQueryStatus;
    const transactionStepStates: Record<
        TransactionDialogStep,
        TransactionStatusState
    > = useMemo(
        () => ({
            [TransactionDialogStep.PREPARE]: prepareTransactionStatus,
            [TransactionDialogStep.APPROVE]: approveStepStatus,
            [TransactionDialogStep.CONFIRM]: confirmStepStatus,
            [TransactionDialogStep.INDEXING]: indexingStepStatus,
        }),
        [
            prepareTransactionStatus,
            approveStepStatus,
            confirmStepStatus,
            indexingStepStatus,
        ],
    );

    const transactionStepAddon: Record<
        TransactionDialogStep,
        ITransactionStatusStepMetaAddon | undefined
    > = useMemo(
        () => ({
            [TransactionDialogStep.PREPARE]: undefined,
            [TransactionDialogStep.APPROVE]: {
                label: t(
                    `app.shared.transactionDialog.step.${TransactionDialogStep.APPROVE}.addon`,
                ),
                icon: IconType.BLOCKCHAIN_WALLET,
            },
            [TransactionDialogStep.CONFIRM]:
                hash != null
                    ? {
                          label: t(
                              `app.shared.transactionDialog.step.${TransactionDialogStep.CONFIRM}.addon`,
                          ),
                          href: buildEntityUrl({
                              type: ChainEntityType.TRANSACTION,
                              id: hash,
                          }),
                      }
                    : undefined,
            [TransactionDialogStep.INDEXING]: undefined,
        }),
        [t, buildEntityUrl, hash],
    );

    // Specific error labels for known low-level errors; the generic per-step label is the fallback.
    const stepErrorLabelKey: Partial<
        Record<TransactionDialogStep, string | undefined>
    > = useMemo(
        () => ({
            [TransactionDialogStep.APPROVE]:
                transactionDialogUtils.getTransactionErrorLabel(sendError),
            [TransactionDialogStep.CONFIRM]:
                transactionDialogUtils.getTransactionErrorLabel(waitTxError),
        }),
        [sendError, waitTxError],
    );

    const transactionSteps = useMemo(() => {
        const stepKeys = Object.keys(
            TransactionDialogStep,
        ) as TransactionDialogStep[];

        const filteredSteps = transactionType
            ? stepKeys
            : stepKeys.filter(
                  (step) => step !== TransactionDialogStep.INDEXING,
              );

        return filteredSteps.map((stepId, index) => ({
            id: stepId,
            order: (customSteps?.length ?? 0) + index,
            meta: {
                label: t(`app.shared.transactionDialog.step.${stepId}.label`),
                errorLabel: t(
                    stepErrorLabelKey[stepId] ??
                        `app.shared.transactionDialog.step.${stepId}.errorLabel`,
                ),
                warningLabel:
                    stepId === TransactionDialogStep.CONFIRM
                        ? t(
                              `app.shared.transactionDialog.step.${stepId}.warningLabel`,
                          )
                        : undefined,
                state: transactionStepStates[stepId],
                action: transactionStepActions[stepId],
                auto: stepId === TransactionDialogStep.PREPARE,
                addon: transactionStepAddon[stepId],
            },
        }));
    }, [
        transactionType,
        customSteps,
        t,
        stepErrorLabelKey,
        transactionStepStates,
        transactionStepActions,
        transactionStepAddon,
    ]);

    // Disable outside click for all transaction dialogs
    useEffect(
        () => updateOptions({ disableOutsideClick: true }),
        [updateOptions],
    );

    useEffect(() => {
        const { state, action, auto } = activeStepInfo?.meta ?? {};

        if (action == null || state !== 'idle' || !auto) {
            return;
        }

        // Use setTimeout to avoid double mutation on dev + StrictMode
        // (see https://github.com/TanStack/query/issues/5341)
        const timeout = setTimeout(
            () =>
                action({ onError: handleTransactionError(activeStepInfo?.id) }),
            100,
        );
        return () => clearTimeout(timeout);
    }, [activeStepInfo, handleTransactionError]);

    // When resuming, mark steps before the target done and non-auto so the dialog never re-sends.
    const allSteps = useMemo(() => {
        const steps = [...(customSteps ?? []), ...transactionSteps];

        if (resumeTarget == null) {
            return steps;
        }

        const targetIndex = steps.findIndex((step) => step.id === resumeTarget);
        return steps.map((step, index) =>
            index < targetIndex
                ? {
                      ...step,
                      meta: {
                          ...step.meta,
                          state: 'success' as const,
                          auto: false,
                      },
                  }
                : step,
        );
    }, [customSteps, transactionSteps, resumeTarget]);

    useEffect(() => updateSteps(allSteps), [allSteps, updateSteps]);

    useEffect(() => {
        if (resumeTarget != null) {
            updateActiveStep(resumeTarget);
        }
    }, [resumeTarget, updateActiveStep]);

    useEffect(() => {
        if (waitTxError) {
            handleTransactionError(TransactionDialogStep.CONFIRM)(waitTxError, {
                transaction,
            });
        }
    }, [waitTxError, transaction, handleTransactionError]);

    useEffect(() => {
        if (waitTxStatus === 'success') {
            onSuccessRef.current?.(txReceipt);
            nextStep();
        }
    }, [waitTxStatus, nextStep, txReceipt]);

    // Advance to confirm once the wallet has signed (the hash appears). Failures go to the subscriber.
    useEffect(() => {
        if (hash != null && activeStep === TransactionDialogStep.APPROVE) {
            nextStep();
        }
    }, [hash, activeStep, nextStep]);

    return (
        <>
            <Dialog.Header description={description} title={title} />
            <Dialog.Content>
                <div className="flex flex-col gap-6 pb-3 md:pb-4">
                    <NetworkSwitchAlert
                        isCrossNetworkTransaction={isCrossNetworkTransaction}
                        networkName={transactionNetworkName}
                    />
                    {confirmStepStatus === 'warning' && (
                        <AlertCard
                            message={t(
                                'app.shared.transactionDialog.confirmWarning.title',
                            )}
                            variant="warning"
                        >
                            {t(
                                'app.shared.transactionDialog.confirmWarning.description',
                            )}
                        </AlertCard>
                    )}
                    {children}
                    <TransactionStatus.Container
                        steps={steps}
                        transactionInfo={transactionInfo}
                    >
                        {steps.map((step) => (
                            <TransactionStatus.Step key={step.id} {...step} />
                        ))}
                    </TransactionStatus.Container>
                </div>
            </Dialog.Content>
            <TransactionDialogFooter
                activeStep={activeStepInfo}
                disableCancel={disableCancel}
                indexingFallbackUrl={indexingFallbackUrl}
                onCancelClick={onCancelClick}
                onError={handleTransactionError(activeStepInfo?.id)}
                proposalSlug={transactionStatus?.slug}
                submitLabel={submitLabel}
                successLink={successLink}
                transactionType={transactionType}
                txReceipt={txReceipt}
            />
        </>
    );
};
