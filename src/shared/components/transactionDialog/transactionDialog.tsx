import { DialogContent, DialogFooter, Heading, IconType } from '@aragon/ods';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import type { UseQueryReturnType } from 'wagmi/query';
import { useDialogContext } from '../dialogProvider';
import { TransactionStatus, type TransactionStatusState } from '../transactionStatus';
import { TransactionDialogStep, type ITransactionDialogProps } from './transactionDialog.api';

const stepStateSubmitLabel: Partial<Record<TransactionDialogStep, Partial<Record<TransactionStatusState, string>>>> = {
    [TransactionDialogStep.APPROVE]: {
        idle: 'Approve transaction',
        pending: 'Awaiting approval',
        error: 'Resend to wallet',
    },
};

const queryToStepState = ({ status, fetchStatus }: UseQueryReturnType): TransactionStatusState =>
    status === 'pending' ? (fetchStatus === 'fetching' ? 'pending' : 'idle') : status;

export const TransactionDialog = <TCustomStepId extends string>(props: ITransactionDialogProps<TCustomStepId>) => {
    const { title, description, customSteps = [], stepper, submitLabel, children, prepareTransaction } = props;

    const { close } = useDialogContext();

    const { activeStep, steps, activeStepIndex, nextStep, updateActiveStep } = stepper;
    const activeStepInfo = activeStep != null ? steps[activeStepIndex] : undefined;

    const {
        mutate: prepareTx,
        status: prepareTransactionStatus,
        data: transaction,
    } = useMutation({ mutationFn: prepareTransaction, onSuccess: nextStep });

    const {
        sendTransaction,
        status: sendTransactonStatus,
        data: transactionHash,
    } = useSendTransaction({ mutation: { onSuccess: nextStep } });

    const waitForTransactionQuery = useWaitForTransactionReceipt({ hash: transactionHash });

    const handleNextStep = () => {
        if (activeStep === TransactionDialogStep.APPROVE) {
            sendTransaction({ ...transaction!, gas: null });
        } else if (activeStep === TransactionDialogStep.CONFIRM) {
            updateActiveStep(TransactionDialogStep.APPROVE);
            sendTransaction({ ...transaction!, gas: null });
        } else {
            customSteps[activeStepIndex]?.action?.();
        }
    };

    useEffect(() => {
        const action = activeStep === TransactionDialogStep.PREPARE ? prepareTx : customSteps[activeStepIndex]?.action;

        if (action == null || activeStepInfo?.meta.state !== 'idle') {
            return;
        }

        // Use setTimeout to avoid double mutation on dev + StrictMode
        // (see https://github.com/TanStack/query/issues/5341)
        const timeout = setTimeout(() => action(), 100);

        return () => clearTimeout(timeout);
    }, [prepareTx, activeStep, customSteps, activeStepIndex, activeStepInfo]);

    const isErrorState = activeStepInfo?.meta.state === 'error';
    const isLoadingState = activeStepInfo?.meta.state === 'pending';

    const isCancelDisabled =
        activeStep === TransactionDialogStep.CONFIRM && ['pending', 'success'].includes(sendTransactonStatus);

    const customSubmitLabel =
        activeStepInfo != null ? stepStateSubmitLabel[activeStep!]?.[activeStepInfo.meta.state] : undefined;
    const defaultSubmitLabel = isErrorState ? 'Retry' : submitLabel;

    const processedSubmitLabel = customSubmitLabel ?? defaultSubmitLabel;

    return (
        <div className="flex flex-col gap-4">
            <DialogContent className="flex flex-col gap-6 pt-6">
                <div className="flex flex-col gap-2">
                    <Heading size="h2">{title}</Heading>
                    <p className="text-sm font-normal leading-normal text-neutral-800">{description}</p>
                </div>
                {children}
                <TransactionStatus.Container stepper={stepper}>
                    {customSteps.map((step) => (
                        <TransactionStatus.Step key={step.id} id={step.id} order={step.order} {...step.meta} />
                    ))}
                    <TransactionStatus.Step
                        id={TransactionDialogStep.PREPARE}
                        order={customSteps.length}
                        label="Prepare transaction"
                        errorLabel="Unable to prepare transaction"
                        state={prepareTransactionStatus}
                    />
                    <TransactionStatus.Step
                        id={TransactionDialogStep.APPROVE}
                        order={customSteps.length + 1}
                        label="Approve transaction"
                        errorLabel="Rejected by wallet"
                        state={sendTransactonStatus}
                    />
                    <TransactionStatus.Step
                        id={TransactionDialogStep.CONFIRM}
                        order={customSteps.length + 2}
                        label="Onchain confirmation"
                        errorLabel="Confirmation failed"
                        state={queryToStepState(waitForTransactionQuery)}
                    />
                </TransactionStatus.Container>
            </DialogContent>
            <DialogFooter
                primaryAction={{
                    label: processedSubmitLabel,
                    onClick: handleNextStep,
                    iconLeft: isErrorState ? IconType.RELOAD : undefined,
                    // @ts-expect-error to be fixed on ODS lib update
                    isLoading: isLoadingState,
                }}
                // @ts-expect-error to be fixed on ODS lib update
                secondaryAction={{ label: 'Cancel', onClick: close, disabled: isCancelDisabled }}
            />
        </div>
    );
};
