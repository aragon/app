import { DialogContent, Heading } from '@aragon/ods';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import type { UseQueryReturnType } from 'wagmi/query';
import { TransactionStatus, type TransactionStatusState } from '../transactionStatus';
import { TransactionDialogStep, type ITransactionDialogProps } from './transactionDialog.api';
import { TransactionDialogFooter } from './transactionDialogFooter';

const queryToStepState = ({ status, fetchStatus }: UseQueryReturnType): TransactionStatusState =>
    status === 'pending' ? (fetchStatus === 'fetching' ? 'pending' : 'idle') : status;

export const TransactionDialog = <TCustomStepId extends string>(props: ITransactionDialogProps<TCustomStepId>) => {
    const { title, description, customSteps = [], stepper, submitLabel, children, prepareTransaction } = props;

    const { activeStep, steps, activeStepIndex, nextStep, updateActiveStep } = stepper;
    const activeStepInfo = activeStep != null ? steps[activeStepIndex] : undefined;

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

    const waitForTransactionQuery = useWaitForTransactionReceipt({ hash: transactionHash });

    const handleSendTransaction = useCallback(() => {
        if (transaction == null) {
            return;
        }

        sendTransaction({ ...transaction, gas: null });
    }, [transaction, sendTransaction]);

    const handleRetryTransaction = useCallback(() => {
        updateActiveStep(TransactionDialogStep.APPROVE);
        handleSendTransaction();
    }, [updateActiveStep, handleSendTransaction]);

    const prepareStep = useMemo(
        () => ({
            id: TransactionDialogStep.PREPARE,
            action: prepareTransactionMutate,
            auto: true,
            meta: {
                label: 'Prepare transaction',
                errorLabel: 'Unable to prepare transaction',
                state: prepareTransactionStatus,
            },
        }),
        [prepareTransactionMutate, prepareTransactionStatus],
    );

    const approveStep = useMemo(
        () => ({
            id: TransactionDialogStep.APPROVE,
            action: handleSendTransaction,
            auto: false,
            meta: {
                label: 'Approve transaction',
                errorLabel: 'Rejected by wallet',
                state: approveTransactionStatus,
            },
        }),
        [handleSendTransaction, approveTransactionStatus],
    );

    const confirmStep = useMemo(
        () => ({
            id: TransactionDialogStep.CONFIRM,
            action: handleRetryTransaction,
            auto: false,
            meta: {
                label: 'Onchain confirmation',
                errorLabel: 'Confirmation failed',
                state: queryToStepState(waitForTransactionQuery),
            },
        }),
        [handleRetryTransaction, waitForTransactionQuery],
    );

    const staticSteps = useMemo(() => [prepareStep, approveStep, confirmStep], [prepareStep, approveStep, confirmStep]);
    const completeSteps = useMemo(() => [...customSteps, ...staticSteps], [customSteps, staticSteps]);

    const handleNextStep = () => completeSteps[activeStepIndex]?.action?.();

    useEffect(() => {
        const isIdle = activeStepInfo?.meta.state === 'idle';
        const { action, auto } = completeSteps[activeStepIndex] ?? {};

        if (action == null || !isIdle || !auto) {
            return;
        }

        // Use setTimeout to avoid double mutation on dev + StrictMode
        // (see https://github.com/TanStack/query/issues/5341)
        const timeout = setTimeout(() => action(), 100);
        return () => clearTimeout(timeout);
    }, [completeSteps, activeStepIndex, activeStepInfo]);

    return (
        <div className="flex flex-col gap-4">
            <DialogContent className="flex flex-col gap-6 pt-6">
                <div className="flex flex-col gap-2">
                    <Heading size="h2">{title}</Heading>
                    <p className="text-sm font-normal leading-normal text-neutral-800">{description}</p>
                </div>
                {children}
                <TransactionStatus.Container stepper={stepper}>
                    {completeSteps.map((step, index) => (
                        <TransactionStatus.Step key={step.id} id={step.id} order={index} {...step.meta} />
                    ))}
                </TransactionStatus.Container>
            </DialogContent>
            <TransactionDialogFooter
                submitLabel={submitLabel}
                onNextStepClick={handleNextStep}
                activeStep={activeStepInfo}
            />
        </div>
    );
};
