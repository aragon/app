import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import { useTransactionStatus } from '@/shared/api/transactionService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { useTranslations } from '../translationsProvider';
import {
    type ITransactionDialogCustomProps,
    type ITransactionDialogStep,
    TransactionDialogStep,
} from './transactionDialog.api';
import { TransactionDialogFooter } from './transactionDialogFooter';
import { TransactionDialogShell } from './transactionDialogShell';
import { transactionDialogUtils } from './transactionDialogUtils';

const indexingStepInterval = 1000;

const areCustomStepsEqual = <TCustomStepId extends string>(
    currentSteps: ITransactionDialogStep<TCustomStepId>[],
    nextSteps: ITransactionDialogStep<TCustomStepId>[],
) => {
    if (currentSteps.length !== nextSteps.length) {
        return false;
    }

    return nextSteps.every((nextStep, index) => {
        const currentStep = currentSteps[index];

        return (
            currentStep?.id === nextStep.id &&
            currentStep.order === nextStep.order &&
            currentStep.meta.label === nextStep.meta.label &&
            currentStep.meta.state === nextStep.meta.state &&
            currentStep.meta.errorLabel === nextStep.meta.errorLabel &&
            currentStep.meta.warningLabel === nextStep.meta.warningLabel &&
            currentStep.meta.auto === nextStep.meta.auto &&
            currentStep.meta.addon?.label === nextStep.meta.addon?.label &&
            currentStep.meta.addon?.href === nextStep.meta.addon?.href &&
            currentStep.meta.addon?.icon === nextStep.meta.addon?.icon
        );
    });
};

export const CustomTransactionController = <TCustomStepId extends string>(
    props: ITransactionDialogCustomProps<TCustomStepId>,
) => {
    const {
        title,
        description,
        submitLabel,
        customSteps,
        stepper,
        transactionInfo,
        network = Network.ETHEREUM_MAINNET,
        showStatus = true,
        children,
        isComplete,
        completion,
        primaryActionDisabled,
        disableCancel,
        onDismiss,
        transactionType,
        transactionHash,
        indexingFallbackUrl,
        onIndexed,
    } = props;
    const { activeStep, steps, updateSteps, updateActiveStep } = stepper;
    const { t } = useTranslations();
    const { address } = useWalletAccount();
    const { updateOptions } = useDialogContext();
    const { isCrossNetworkTransaction, networkName } = useNetworkSwitch({
        network,
    });
    const isIndexing = activeStep === TransactionDialogStep.INDEXING;
    const { data: transactionStatus } = useTransactionStatus(
        {
            urlParams: {
                network,
                transactionHash: transactionHash ?? '',
            },
            queryParams: { type: transactionType! },
        },
        {
            enabled:
                transactionType != null &&
                transactionHash != null &&
                isIndexing,
            refetchInterval: ({ state }) =>
                state.data?.isProcessed ? false : indexingStepInterval,
        },
    );
    const isTransactionIndexed = transactionStatus?.isProcessed === true;
    const indexedHashRef = useRef<string | undefined>(undefined);
    const onIndexedFiredRef = useRef(false);
    const [hasIndexed, setHasIndexed] = useState(false);

    useEffect(() => {
        if (indexedHashRef.current === transactionHash) {
            return;
        }

        indexedHashRef.current = transactionHash;
        onIndexedFiredRef.current = false;
        setHasIndexed(false);
    }, [transactionHash]);

    useEffect(() => {
        if (
            transactionType == null ||
            transactionHash == null ||
            !isComplete ||
            hasIndexed ||
            activeStep === TransactionDialogStep.INDEXING
        ) {
            return;
        }

        updateActiveStep(TransactionDialogStep.INDEXING);
    }, [
        activeStep,
        hasIndexed,
        isComplete,
        transactionHash,
        transactionType,
        updateActiveStep,
    ]);

    useEffect(() => {
        if (
            !isTransactionIndexed ||
            onIndexedFiredRef.current ||
            transactionType == null ||
            transactionHash == null
        ) {
            return;
        }

        onIndexedFiredRef.current = true;
        setHasIndexed(true);
        onIndexed?.({ slug: transactionStatus?.slug });
    }, [
        isTransactionIndexed,
        onIndexed,
        transactionHash,
        transactionStatus?.slug,
        transactionType,
    ]);

    const indexingStep = useMemo<
        ITransactionDialogStep<TCustomStepId | TransactionDialogStep>
    >(
        () => ({
            id: TransactionDialogStep.INDEXING,
            order: customSteps.length,
            meta: {
                label: t(
                    `app.shared.transactionDialog.step.${TransactionDialogStep.INDEXING}.label`,
                ),
                errorLabel: t(
                    `app.shared.transactionDialog.step.${TransactionDialogStep.INDEXING}.errorLabel`,
                ),
                state: hasIndexed
                    ? 'success'
                    : isComplete && transactionHash != null
                      ? 'pending'
                      : 'idle',
                action: () => undefined,
            },
        }),
        [customSteps.length, hasIndexed, isComplete, t, transactionHash],
    );
    const composedSteps = useMemo<
        ITransactionDialogStep<TCustomStepId | TransactionDialogStep>[]
    >(
        () =>
            transactionType == null
                ? customSteps
                : [...customSteps, indexingStep],
        [customSteps, indexingStep, transactionType],
    );
    const activeStepInfo = composedSteps.find((step) => step.id === activeStep);
    const isCompleteWithIndexing =
        isComplete && (transactionType == null || hasIndexed);
    const onDismissRef = useRef(onDismiss);
    const disableCancelRef = useRef(disableCancel);

    onDismissRef.current = onDismiss;
    disableCancelRef.current = disableCancel;

    const autoActionRef = useRef<
        | {
              key: string;
              fired: boolean;
          }
        | undefined
    >(undefined);

    const handleTransactionError = useCallback(
        (error: unknown) => {
            transactionDialogUtils.monitorTransactionError(error, {
                stepId: activeStepInfo?.id,
                from: address,
            });
        },
        [activeStepInfo?.id, address],
    );

    useEffect(
        () =>
            updateOptions({
                disableOutsideClick: true,
                onClose: () => {
                    if (!disableCancelRef.current) {
                        onDismissRef.current();
                    }
                },
            }),
        [updateOptions],
    );

    useEffect(() => {
        if (!areCustomStepsEqual(steps, composedSteps)) {
            updateSteps(composedSteps);
        }
    }, [composedSteps, steps, updateSteps]);

    useEffect(() => {
        const { action, auto, state } = activeStepInfo?.meta ?? {};
        const stepId = activeStepInfo?.id;

        if (isCompleteWithIndexing || stepId == null) {
            autoActionRef.current = undefined;
            return;
        }

        const key = String(stepId);
        if (autoActionRef.current?.key !== key) {
            autoActionRef.current = undefined;
        }

        if (action == null || state !== 'idle' || !auto) {
            return;
        }

        const previousAction = autoActionRef.current;
        if (previousAction?.key === key && previousAction.fired) {
            return;
        }

        const currentAction = { key, fired: false };
        autoActionRef.current = currentAction;
        const timeout = setTimeout(() => {
            if (autoActionRef.current !== currentAction) {
                return;
            }

            currentAction.fired = true;
            action({ onError: handleTransactionError });
        }, 100);

        return () => {
            clearTimeout(timeout);
            if (
                autoActionRef.current === currentAction &&
                !currentAction.fired
            ) {
                autoActionRef.current = undefined;
            }
        };
    }, [activeStepInfo, handleTransactionError, isCompleteWithIndexing]);

    return (
        <TransactionDialogShell
            description={description}
            footer={
                <TransactionDialogFooter
                    activeStep={activeStepInfo}
                    completion={completion}
                    disableCancel={disableCancel}
                    indexingFallbackUrl={indexingFallbackUrl}
                    isComplete={isCompleteWithIndexing}
                    mode="custom"
                    onDismiss={onDismiss}
                    onError={handleTransactionError}
                    primaryActionDisabled={primaryActionDisabled}
                    submitLabel={submitLabel}
                    successLink={undefined}
                    transactionType={transactionType}
                />
            }
            isCrossNetworkTransaction={isCrossNetworkTransaction}
            networkName={networkName}
            showStatus={showStatus}
            statusBeforeChildren
            steps={composedSteps}
            title={title}
            transactionInfo={transactionInfo}
        >
            {children}
        </TransactionDialogShell>
    );
};
