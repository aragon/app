import { ChainEntityType, DialogContent, Heading, IconType, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import type { UseQueryReturnType } from 'wagmi/query';
import {
    TransactionStatus,
    type ITransactionStatusStepMetaAddon,
    type TransactionStatusState,
} from '../transactionStatus';
import { useTranslations } from '../translationsProvider';
import { TransactionDialogStep, type ITransactionDialogProps } from './transactionDialog.api';
import { TransactionDialogFooter } from './transactionDialogFooter';

const queryToStepState = (
    status: UseQueryReturnType['status'],
    fetchStatus: UseQueryReturnType['fetchStatus'],
): TransactionStatusState => (status === 'pending' ? (fetchStatus === 'fetching' ? 'pending' : 'idle') : status);

export const TransactionDialog = <TCustomStepId extends string>(props: ITransactionDialogProps<TCustomStepId>) => {
    const {
        title,
        description,
        customSteps,
        stepper,
        submitLabel,
        successLink,
        children,
        prepareTransaction,
        onCancelClick,
    } = props;

    const { activeStep, steps, activeStepIndex, nextStep, updateActiveStep, updateSteps } = stepper;
    const activeStepInfo = activeStep != null ? steps[activeStepIndex] : undefined;

    const { t } = useTranslations();
    const chainId = useChainId();
    const { buildEntityUrl } = useBlockExplorer({ chainId });

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

    const {
        data: txReceipt,
        status: waitTxStatus,
        fetchStatus: waitTxFetchStatus,
    } = useWaitForTransactionReceipt({
        hash: transactionHash,
    });

    const handleSendTransaction = useCallback(() => {
        if (transaction == null) {
            handleTransactionError();
        } else {
            sendTransaction({ ...transaction, gas: null }, { onError: handleTransactionError });
        }
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

    const transactionStepAddon: Record<TransactionDialogStep, ITransactionStatusStepMetaAddon | undefined> = useMemo(
        () => ({
            [TransactionDialogStep.PREPARE]: undefined,
            [TransactionDialogStep.APPROVE]: {
                label: t(`app.shared.transactionDialog.step.${TransactionDialogStep.APPROVE}.addon`),
                icon: IconType.BLOCKCHAIN_WALLET,
            },
            [TransactionDialogStep.CONFIRM]:
                transactionHash != null
                    ? {
                          label: t(`app.shared.transactionDialog.step.${TransactionDialogStep.CONFIRM}.addon`),
                          href: buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash }),
                      }
                    : undefined,
        }),
        [t, buildEntityUrl, transactionHash],
    );

    const transactionSteps = useMemo(() => {
        const stepKeys = Object.keys(TransactionDialogStep) as TransactionDialogStep[];

        return stepKeys.map((stepId, index) => ({
            id: stepId,
            order: (customSteps?.length ?? 0) + index,
            meta: {
                label: t(`app.shared.transactionDialog.step.${stepId}.label`),
                errorLabel: t(`app.shared.transactionDialog.step.${stepId}.errorLabel`),
                state: transactionStepStates[stepId],
                action: transactionStepActions[stepId],
                auto: stepId === TransactionDialogStep.PREPARE,
                addon: transactionStepAddon[stepId],
            },
        }));
    }, [transactionStepActions, transactionStepStates, transactionStepAddon, customSteps, t]);

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

    useEffect(
        () => updateSteps([...(customSteps ?? []), ...transactionSteps]),
        [customSteps, transactionSteps, updateSteps],
    );

    return (
        <>
            <DialogContent className="flex flex-col gap-6 pb-4 pt-6">
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
                successLink={successLink}
                txReceipt={txReceipt}
                activeStep={activeStepInfo}
                onError={handleTransactionError}
                onCancelClick={onCancelClick}
            />
        </>
    );
};
