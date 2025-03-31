import { Network } from '@/shared/api/daoService';
import { useTransactionStatus } from '@/shared/api/transactionService/queries';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ChainEntityType, Dialog, IconType, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import {
    TransactionStatus,
    type ITransactionStatusStepMetaAddon,
    type TransactionStatusState,
} from '../transactionStatus';
import { useTranslations } from '../translationsProvider';
import { TransactionDialogStep, type ITransactionDialogProps } from './transactionDialog.api';
import { TransactionDialogFooter } from './transactionDialogFooter';
import { transactionDialogUtils } from './transactionDialogUtils';
import type { ITransactionStatus } from '@/shared/api/transactionService/domain';

const maxRetries = 40;

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
        onSuccess,
        network = Network.ETHEREUM_MAINNET,
        transactionType,
        daoId,
    } = props;

    const { activeStep, steps, activeStepIndex, nextStep, updateActiveStep, updateSteps } = stepper;
    const activeStepInfo = activeStep != null ? steps[activeStepIndex] : undefined;

    const { t } = useTranslations();
    const { switchChain, status: switchChainStatus } = useSwitchChain();

    // Make the onSuccess property stable to only trigger it once on transaction success
    const onSuccessRef = useRef(onSuccess);

    const { chainId, address } = useAccount();
    const { id: requiredChainId } = networkDefinitions[network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const [retryCount, setRetryCount] = useState(0);

    const handleTransactionError = useCallback(
        (stepId?: string) => (error: unknown, context?: Record<string, unknown>) =>
            transactionDialogUtils.monitorTransactionError(error, { stepId, from: address, ...context }),
        [address],
    );

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
        error: waitTxError,
    } = useWaitForTransactionReceipt({
        hash: transactionHash,
    });

    // Using the `!` operator here as this hook is only enabled when the transactionHash and transactionType are defined
    const indexingUrlParams = { network, transactionHash: transactionHash! };
    const indexingQueryParams = { type: transactionType! };
    const indexingParams = { urlParams: indexingUrlParams, queryParams: indexingQueryParams };
    const { data: transactionStatus } = useTransactionStatus(indexingParams, {
        enabled: waitTxStatus === 'success',
        refetchInterval: (data) =>
            retryCount < maxRetries && !(data as unknown as ITransactionStatus).isProcessed ? 1000 : false,
    });

    const handleSendTransaction = useCallback(() => {
        const errorHandler = handleTransactionError(TransactionDialogStep.APPROVE);

        if (transaction == null) {
            errorHandler(new Error('TransactionDialog: transaction must be defined.'));
        } else {
            sendTransaction(transaction, { onError: errorHandler });
        }
    }, [transaction, sendTransaction, handleTransactionError]);

    const handleSwitchNetwork = useCallback(
        () => switchChain({ chainId: requiredChainId }, { onSuccess: handleSendTransaction }),
        [switchChain, requiredChainId, handleSendTransaction],
    );

    const handleRetryTransaction = useCallback(() => {
        updateActiveStep(TransactionDialogStep.APPROVE);
        handleSendTransaction();
    }, [updateActiveStep, handleSendTransaction]);

    const approveStepAction = requiredChainId === chainId ? handleSendTransaction : handleSwitchNetwork;
    const transactionStepActions: Record<TransactionDialogStep, () => void> = useMemo(
        () => ({
            [TransactionDialogStep.PREPARE]: prepareTransactionMutate,
            [TransactionDialogStep.APPROVE]: approveStepAction,
            [TransactionDialogStep.CONFIRM]: handleRetryTransaction,
            [TransactionDialogStep.INDEXING]: () => {
                // noOp needed as react query will refetch the transaction status
            },
        }),
        [prepareTransactionMutate, approveStepAction, handleRetryTransaction],
    );

    const approveStepStatus = chainId === requiredChainId ? approveTransactionStatus : switchChainStatus;
    const isIndexing = activeStep === TransactionDialogStep.INDEXING;
    const indexingStepStatus = transactionStatus?.isProcessed ? 'success' : isIndexing ? 'pending' : 'idle';
    const transactionStepStates: Record<TransactionDialogStep, TransactionStatusState> = useMemo(
        () => ({
            [TransactionDialogStep.PREPARE]: prepareTransactionStatus,
            [TransactionDialogStep.APPROVE]: approveStepStatus,
            [TransactionDialogStep.CONFIRM]: transactionDialogUtils.queryToStepState(waitTxStatus, waitTxFetchStatus),
            [TransactionDialogStep.INDEXING]: indexingStepStatus,
        }),
        [prepareTransactionStatus, approveStepStatus, waitTxStatus, waitTxFetchStatus, indexingStepStatus],
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
            [TransactionDialogStep.INDEXING]: undefined,
        }),
        [t, buildEntityUrl, transactionHash],
    );

    const transactionSteps = useMemo(() => {
        const stepKeys = Object.keys(TransactionDialogStep) as TransactionDialogStep[];

        const filteredSteps = transactionType
            ? stepKeys
            : stepKeys.filter((step) => step !== TransactionDialogStep.INDEXING);

        return filteredSteps.map((stepId, index) => ({
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
    }, [transactionType, customSteps, t, transactionStepStates, transactionStepActions, transactionStepAddon]);

    useEffect(() => {
        const { state, action, auto } = activeStepInfo?.meta ?? {};

        if (action == null || state !== 'idle' || !auto) {
            return;
        }

        // Use setTimeout to avoid double mutation on dev + StrictMode
        // (see https://github.com/TanStack/query/issues/5341)
        const timeout = setTimeout(() => action({ onError: handleTransactionError(activeStepInfo?.id) }), 100);
        return () => clearTimeout(timeout);
    }, [activeStepInfo, handleTransactionError]);

    useEffect(
        () => updateSteps([...(customSteps ?? []), ...transactionSteps]),
        [customSteps, transactionSteps, updateSteps],
    );

    useEffect(() => {
        if (waitTxError) {
            handleTransactionError(TransactionDialogStep.CONFIRM)(waitTxError, { transaction });
        }
    }, [waitTxError, transaction, handleTransactionError]);

    useEffect(() => {
        if (waitTxStatus === 'success') {
            onSuccessRef.current?.();
            nextStep();
        }
    }, [waitTxStatus, nextStep]);

    // Use effect to handle the retry count for the transaction status
    // This is to avoid backend being constantly pinged for the transaction status
    useEffect(() => {
        if (isIndexing && !transactionStatus?.isProcessed && retryCount < 40) {
            const interval = setInterval(() => {
                setRetryCount((prev) => prev + 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [transactionStatus, retryCount, isIndexing]);

    return (
        <>
            <Dialog.Header title={title} />
            <Dialog.Content description={description}>
                <div className="flex flex-col gap-6 pb-3 md:pb-4">
                    {children}
                    <TransactionStatus.Container steps={steps}>
                        {steps.map((step) => (
                            <TransactionStatus.Step key={step.id} {...step} />
                        ))}
                    </TransactionStatus.Container>
                </div>
            </Dialog.Content>
            <TransactionDialogFooter
                submitLabel={submitLabel}
                successLink={successLink}
                txReceipt={txReceipt}
                activeStep={activeStepInfo}
                onError={handleTransactionError(activeStepInfo?.id)}
                onCancelClick={onCancelClick}
                transactionType={transactionType}
                daoId={daoId}
            />
        </>
    );
};
