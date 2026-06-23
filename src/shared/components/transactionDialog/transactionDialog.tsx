import { ChainEntityType, Dialog, IconType } from '@aragon/gov-ui-kit';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Hex } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import { useTransactionStatus } from '@/shared/api/transactionService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { usePendingTransaction } from '@/shared/hooks/usePendingTransaction';
import {
    buildIntentId,
    type IPendingTransactionState,
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
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

const indexingStepInterval = 1000;

// Manager status -> approve-step display state.
const managedStatusToStepState = (
    state?: IPendingTransactionState,
): TransactionStatusState => {
    switch (state?.status) {
        case PendingTransactionStatus.SUBMITTED:
            return 'success';
        case PendingTransactionStatus.PENDING:
            return 'pending';
        case PendingTransactionStatus.FAILED:
            return 'error';
        default:
            return 'idle';
    }
};

export const TransactionDialog = <TCustomStepId extends string>(
    props: ITransactionDialogProps<TCustomStepId>,
) => {
    const {
        title,
        description,
        intentId: intentIdProp,
        customSteps,
        transactionInfo,
        stepper,
        submitLabel,
        successLink,
        children,
        prepareTransaction,
        onCancelClick,
        onSuccess,
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
    const { updateOptions } = useDialogContext();

    // Make the onSuccess property stable to only trigger it once on transaction success
    const onSuccessRef = useRef(onSuccess);

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

    // Caller override when the calldata is non-deterministic (e.g. proposals); otherwise derive it
    // from the prepared transaction. This keys the manager record we resume from.
    const intentId = useMemo(
        () =>
            intentIdProp ??
            (transaction != null && address != null
                ? buildIntentId({
                      from: address,
                      chainId: requiredChainId,
                      to: transaction.to,
                      data: transaction.data,
                      value: transaction.value,
                  })
                : undefined),
        [intentIdProp, transaction, address, requiredChainId],
    );

    const managedTransaction = usePendingTransaction(intentId);

    // Latch the hash so the confirm/index steps keep working after the record is cleared on confirm.
    const [latchedHash, setLatchedHash] = useState<Hex>();
    useEffect(() => {
        if (managedTransaction?.hash != null) {
            setLatchedHash(managedTransaction.hash);
        }
    }, [managedTransaction?.hash]);

    const transactionHash = latchedHash ?? managedTransaction?.hash;

    // Step to resume to when a request for this action is already in flight on open (set below).
    const [resumeTarget, setResumeTarget] = useState<TransactionDialogStep>();
    const resumeChecked = useRef(false);

    const {
        data: txReceipt,
        status: waitTxStatus,
        fetchStatus: waitTxFetchStatus,
        error: waitTxError,
    } = useWaitForTransactionReceipt({
        hash: transactionHash,
    });

    const isIndexing = activeStep === TransactionDialogStep.INDEXING;

    // Using the `!` operator here as this hook is only enabled when the transactionHash and transactionType are defined
    const indexingUrlParams = { network, transactionHash: transactionHash! };
    const indexingParams = {
        urlParams: indexingUrlParams,
        queryParams: { type: transactionType! },
    };
    const { data: transactionStatus } = useTransactionStatus(indexingParams, {
        enabled: waitTxStatus === 'success' && isIndexing,
        refetchInterval: ({ state }) =>
            state.data?.isProcessed ? false : indexingStepInterval,
    });

    const handleSendTransaction = useCallback(() => {
        const errorHandler = handleTransactionError(
            TransactionDialogStep.APPROVE,
        );

        if (transaction == null || intentId == null) {
            errorHandler(
                new Error('TransactionDialog: transaction must be defined.'),
            );
            return;
        }

        // Pin to the required chain so wagmi rejects (rather than silently signing) if the wallet is
        // still on the wrong one.
        pendingTransactionManager.send(intentId, {
            ...transaction,
            chainId: requiredChainId,
        });
    }, [transaction, intentId, requiredChainId, handleTransactionError]);

    const handleRetryTransaction = useCallback(() => {
        updateActiveStep(TransactionDialogStep.APPROVE);
        handleSendTransaction();
    }, [updateActiveStep, handleSendTransaction]);

    const approveStepAction = useCallback(
        () => withNetworkSwitch(handleSendTransaction),
        [withNetworkSwitch, handleSendTransaction],
    );
    const transactionStepActions: Record<TransactionDialogStep, () => void> =
        useMemo(
            () => ({
                [TransactionDialogStep.PREPARE]: prepareTransactionMutate,
                [TransactionDialogStep.APPROVE]: approveStepAction,
                [TransactionDialogStep.CONFIRM]: handleRetryTransaction,
                [TransactionDialogStep.INDEXING]: () => {
                    // noOp needed as react query will refetch the transaction status
                },
            }),
            [
                prepareTransactionMutate,
                approveStepAction,
                handleRetryTransaction,
            ],
        );

    const approveStepStatus = isCrossNetworkTransaction
        ? switchChainStatus
        : transactionHash != null
          ? 'success'
          : managedStatusToStepState(managedTransaction);
    const indexingStepStatus = transactionStatus?.isProcessed
        ? 'success'
        : isIndexing
          ? 'pending'
          : 'idle';
    const transactionStepStates: Record<
        TransactionDialogStep,
        TransactionStatusState
    > = useMemo(
        () => ({
            [TransactionDialogStep.PREPARE]: prepareTransactionStatus,
            [TransactionDialogStep.APPROVE]: approveStepStatus,
            [TransactionDialogStep.CONFIRM]:
                transactionDialogUtils.queryToStepState(
                    waitTxStatus,
                    waitTxFetchStatus,
                ),
            [TransactionDialogStep.INDEXING]: indexingStepStatus,
        }),
        [
            prepareTransactionStatus,
            approveStepStatus,
            waitTxStatus,
            waitTxFetchStatus,
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
                transactionHash != null
                    ? {
                          label: t(
                              `app.shared.transactionDialog.step.${TransactionDialogStep.CONFIRM}.addon`,
                          ),
                          href: buildEntityUrl({
                              type: ChainEntityType.TRANSACTION,
                              id: transactionHash,
                          }),
                      }
                    : undefined,
            [TransactionDialogStep.INDEXING]: undefined,
        }),
        [t, buildEntityUrl, transactionHash],
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
                    `app.shared.transactionDialog.step.${stepId}.errorLabel`,
                ),
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

    // On open, resume where a prior attempt left off: SUBMITTED -> confirm (on the hash, survives a
    // reload), a live PENDING -> sign. Anything else (a reloaded PENDING with no live promise, or a
    // failure) is cleared so the dialog starts fresh.
    useEffect(() => {
        if (intentId == null || resumeChecked.current) {
            return;
        }
        resumeChecked.current = true;

        const status = pendingTransactionManager.get(intentId)?.status;
        if (status === PendingTransactionStatus.SUBMITTED) {
            setResumeTarget(TransactionDialogStep.CONFIRM);
        } else if (
            status === PendingTransactionStatus.PENDING &&
            !pendingTransactionManager.isInterrupted(intentId)
        ) {
            setResumeTarget(TransactionDialogStep.APPROVE);
        } else if (status != null) {
            pendingTransactionManager.clear(intentId);
        }
    }, [intentId]);

    useEffect(() => {
        const allSteps = [...(customSteps ?? []), ...transactionSteps];

        if (resumeTarget == null) {
            updateSteps(allSteps);
            return;
        }

        // Resuming: mark the steps before the target done and stop them auto-running.
        const targetIndex = allSteps.findIndex(
            (step) => step.id === resumeTarget,
        );
        updateSteps(
            allSteps.map((step, index) =>
                index < targetIndex
                    ? {
                          ...step,
                          meta: { ...step.meta, state: 'success', auto: false },
                      }
                    : step,
            ),
        );
    }, [customSteps, transactionSteps, updateSteps, resumeTarget]);

    // Jump to the resume target once it is known and the steps are registered.
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
            // Done — clear the record so a re-open starts fresh (the display uses the latched hash).
            if (intentId != null) {
                pendingTransactionManager.clear(intentId);
            }
            onSuccessRef.current?.(txReceipt);
            nextStep();
        }
    }, [waitTxStatus, intentId, nextStep, txReceipt]);

    // Wallet outcome: signed -> advance to confirm; failed -> log (cancellations filtered downstream).
    useEffect(() => {
        const status = managedTransaction?.status;
        if (
            status === PendingTransactionStatus.SUBMITTED &&
            activeStep === TransactionDialogStep.APPROVE
        ) {
            nextStep();
        } else if (status === PendingTransactionStatus.FAILED) {
            handleTransactionError(TransactionDialogStep.APPROVE)(
                managedTransaction?.error,
            );
        }
    }, [managedTransaction, activeStep, nextStep, handleTransactionError]);

    return (
        <>
            <Dialog.Header description={description} title={title} />
            <Dialog.Content>
                <div className="flex flex-col gap-6 pb-3 md:pb-4">
                    <NetworkSwitchAlert
                        isCrossNetworkTransaction={isCrossNetworkTransaction}
                        networkName={transactionNetworkName}
                    />
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
