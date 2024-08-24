import { DialogContent, Heading } from '@aragon/ods';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import type { UseQueryReturnType } from 'wagmi/query';
import { TransactionStatus, type TransactionStatusState } from '../transactionStatus';
import { useTranslations } from '../translationsProvider';
import { TransactionDialogStep, type ITransactionDialogProps } from './transactionDialog.api';
import { TransactionDialogFooter } from './transactionDialogFooter';

const queryToStepState = (
    status: UseQueryReturnType['status'],
    fetchStatus: UseQueryReturnType['fetchStatus'],
): TransactionStatusState => (status === 'pending' ? (fetchStatus === 'fetching' ? 'pending' : 'idle') : status);

export const TransactionDialog = <TCustomStepId extends string>(props: ITransactionDialogProps<TCustomStepId>) => {
    const { title, description, customSteps = [], stepper, submitLabel, children, prepareTransaction } = props;

    const { activeStep, steps, activeStepIndex, nextStep, updateActiveStep, updateSteps } = stepper;
    const activeStepInfo = activeStep != null ? steps[activeStepIndex] : undefined;

    const { t } = useTranslations();

    const handleTransactionError = useCallback(() => {
        // TODO: Report the error to an error reporting service (APP-3107)
    }, []);

    const {
        mutate: prepareTransactionMutate,
        status: prepareTransactionStatus,
        data: transaction,
    } = useMutation({ mutationFn: prepareTransaction, onSuccess: nextStep });

    const {
        sendTransaction,
        status: approveTransactionStatus,
        data: transactionHash,
    } = useSendTransaction({ mutation: { onSuccess: nextStep } });

    const { status: waitTxStatus, fetchStatus: waitTxFetchStatus } = useWaitForTransactionReceipt({
        hash: transactionHash,
    });

    const handleSendTransaction = useCallback(() => {
        if (transaction == null) {
            return;
        }

        sendTransaction({ ...transaction, gas: null }, { onError: handleTransactionError });
    }, [transaction, sendTransaction, handleTransactionError]);

    const handleRetryTransaction = useCallback(() => {
        updateActiveStep(TransactionDialogStep.APPROVE);
        handleSendTransaction();
    }, [updateActiveStep, handleSendTransaction]);

    const transactionStepActions: Record<TransactionDialogStep, () => void> = useMemo(
        () => ({
            [TransactionDialogStep.PREPARE]: prepareTransactionMutate,
            [TransactionDialogStep.APPROVE]: handleSendTransaction,
            [TransactionDialogStep.CONFIRM]: handleRetryTransaction,
        }),
        [prepareTransactionMutate, handleSendTransaction, handleRetryTransaction],
    );

    const transactionStepStates: Record<TransactionDialogStep, TransactionStatusState> = useMemo(
        () => ({
            [TransactionDialogStep.PREPARE]: prepareTransactionStatus,
            [TransactionDialogStep.APPROVE]: approveTransactionStatus,
            [TransactionDialogStep.CONFIRM]: queryToStepState(waitTxStatus, waitTxFetchStatus),
        }),
        [prepareTransactionStatus, approveTransactionStatus, waitTxStatus, waitTxFetchStatus],
    );

    const transactionSteps = useMemo(() => {
        const stepKeys = Object.keys(TransactionDialogStep) as TransactionDialogStep[];

        return stepKeys.map((stepId, index) => ({
            id: stepId,
            order: customSteps.length + index,
            meta: {
                label: t(`app.shared.transactionDialog.step.${stepId}.label`),
                errorLabel: t(`app.shared.transactionDialog.step.${stepId}.errorLabel`),
                state: transactionStepStates[stepId],
                action: transactionStepActions[stepId],
                auto: stepId === TransactionDialogStep.PREPARE,
            },
        }));
    }, [transactionStepActions, transactionStepStates, customSteps, t]);

    useEffect(() => {
        const { state, action, auto } = activeStepInfo?.meta ?? {};

        if (action == null || state !== 'idle' || !auto) {
            return;
        }

        // Use setTimeout to avoid double mutation on dev + StrictMode
        // (see https://github.com/TanStack/query/issues/5341)
        const timeout = setTimeout(() => action({ onError: handleTransactionError }), 100);
        return () => clearTimeout(timeout);
    }, [activeStepInfo, handleTransactionError]);

    useEffect(() => updateSteps([...customSteps, ...transactionSteps]), [customSteps, transactionSteps, updateSteps]);

    return (
        <div className="flex flex-col gap-4">
            <DialogContent className="flex flex-col gap-6 pt-6">
                <div className="flex flex-col gap-2">
                    <Heading size="h2">{title}</Heading>
                    <p className="text-sm font-normal leading-normal text-neutral-800">{description}</p>
                </div>
                {children}
                <TransactionStatus.Container steps={steps}>
                    {steps.map((step) => (
                        <TransactionStatus.Step key={step.id} {...step} />
                    ))}
                </TransactionStatus.Container>
            </DialogContent>
            <TransactionDialogFooter
                submitLabel={submitLabel}
                activeStep={activeStepInfo}
                onError={handleTransactionError}
            />
        </div>
    );
};
