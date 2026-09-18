import { DialogFooter, IconType } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import type { TransactionReceipt } from 'viem';
import type { TransactionType } from '@/shared/api/transactionService';
import { useBlockNavigationContext } from '../blockNavigationContext';
import { useDialogContext } from '../dialogProvider';
import type { TransactionStatusState } from '../transactionStatus';
import { useTranslations } from '../translationsProvider';
import {
    type IBuildTransactionDialogSuccessLinkHref,
    type ITransactionDialogActionParams,
    type ITransactionDialogCompletion,
    type ITransactionDialogProps,
    type ITransactionDialogStep,
    TransactionDialogStep,
    type TransactionDialogSuccessLinkHref,
} from './transactionDialog.api';

export interface ITransactionDialogFooterProps<
    TCustomStepId extends string = string,
> {
    /**
     * Label to be used by default for the submit button.
     */
    submitLabel: string;
    /**
     * Link displayed when the managed transaction has been sent successfully.
     */
    successLink: ITransactionDialogProps['successLink'];
    /**
     * Receipt of the transaction used for building the managed success link.
     */
    txReceipt?: TransactionReceipt;
    /**
     * Information about the current active step.
     */
    activeStep?: ITransactionDialogStep<TCustomStepId>;
    /**
     * Callback to be called on transaction error.
     */
    onError: ITransactionDialogActionParams['onError'];
    /**
     * Callback called on managed cancel button click.
     */
    onCancelClick?: ITransactionDialogProps['onCancelClick'];
    /**
     * Type of the transaction to determine whether or not to show the indexing step.
     */
    transactionType?: TransactionType;
    /**
     * Slug of the proposal if the transaction type is creating a proposal.
     */
    proposalSlug?: string;
    /**
     * Fallback URL if the indexing step moves to the proceed anyway state.
     */
    indexingFallbackUrl?: ITransactionDialogProps['indexingFallbackUrl'];
    /**
     * When true, renders caller-owned completion instead of a receipt-backed managed success action.
     */
    mode?: 'custom';
    /**
     * Explicit caller-owned terminal state.
     */
    isComplete?: boolean;
    /**
     * Receipt-free completion action for custom mode.
     */
    completion?: ITransactionDialogCompletion;
    /**
     * Disables the custom primary action while caller-owned gates are unresolved.
     */
    primaryActionDisabled?: boolean;
    /**
     * Scoped custom dismissal handler.
     */
    onDismiss?: () => void;
    /**
     * When true, the cancel button in the dialog footer is permanently disabled.
     */
    disableCancel?: boolean;
}

const stepStateSubmitLabel: Partial<
    Record<
        TransactionDialogStep,
        Partial<Record<TransactionStatusState, string>>
    >
> = {
    [TransactionDialogStep.APPROVE]: {
        idle: 'app.shared.transactionDialog.footer.approve.idle',
        pending: 'app.shared.transactionDialog.footer.approve.pending',
        error: 'app.shared.transactionDialog.footer.approve.error',
    },
    [TransactionDialogStep.CONFIRM]: {
        warning: 'app.shared.transactionDialog.footer.confirm.warning',
    },
};

const buildSuccessLink = (
    successHref: TransactionDialogSuccessLinkHref,
    params: IBuildTransactionDialogSuccessLinkHref,
): string | undefined => {
    if (typeof successHref === 'string') {
        return successHref;
    }

    return successHref(params);
};

const indexingStepTimeout = 14_000;

export const TransactionDialogFooter = <TCustomStepId extends string = string>(
    props: ITransactionDialogFooterProps<TCustomStepId>,
) => {
    const {
        submitLabel,
        successLink,
        txReceipt,
        activeStep,
        onError,
        onCancelClick,
        transactionType,
        indexingFallbackUrl,
        proposalSlug,
        disableCancel,
        mode,
        isComplete = false,
        completion,
        primaryActionDisabled = false,
        onDismiss,
    } = props;

    // For two step transactions we move from first to second step automatically on success, so in those cases
    // we will not have a success link and just use the default label to satisfy the interface.
    const {
        label: successLabel,
        href: successHref,
        onClick: successOnClick,
    } = successLink ?? { label: '' };

    const { id: stepId, meta } = activeStep ?? {};
    const { state, action } = meta ?? {};

    const { setIsBlocked } = useBlockNavigationContext();

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const isCustom = mode === 'custom';
    const isIndexing = stepId === TransactionDialogStep.INDEXING;

    const [showProceedAnyway, setShowProceedAnyway] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!isCustom && isIndexing && state === 'pending') {
            timer = setTimeout(
                () => setShowProceedAnyway(true),
                indexingStepTimeout,
            );
        }

        return () => {
            clearTimeout(timer);
        };
    }, [isCustom, isIndexing, state]);

    const isErrorState = state === 'error';
    const isSuccessState = state === 'success';
    const isPendingState = state === 'pending';
    const isWarningState = state === 'warning';

    const successStep = transactionType
        ? TransactionDialogStep.INDEXING
        : TransactionDialogStep.CONFIRM;

    const displaySuccessLink =
        !isCustom && stepId === successStep && isSuccessState;
    const displayCompletion = isCustom && isComplete;

    // When the dialog reaches a state where we intentionally allow the user to navigate away
    // (e.g. success link, completion action, or "proceed anyway"), ensure navigation is unblocked
    // before the user clicks a link.
    useEffect(() => {
        if (displaySuccessLink || displayCompletion || showProceedAnyway) {
            setIsBlocked(false);
        }
    }, [
        displayCompletion,
        displaySuccessLink,
        showProceedAnyway,
        setIsBlocked,
    ]);

    const isCancelDisabled =
        disableCancel ||
        (!isCustom &&
            (stepId === TransactionDialogStep.CONFIRM ||
                stepId === TransactionDialogStep.INDEXING) &&
            (isSuccessState || isPendingState));

    const customSubmitLabel =
        !isCustom && stepId != null && state != null
            ? stepStateSubmitLabel[stepId]?.[state]
            : undefined;
    const defaultSubmitLabel = displayCompletion
        ? (completion?.label ?? submitLabel)
        : isErrorState
          ? t('app.shared.transactionDialog.footer.retry')
          : displaySuccessLink
            ? successLabel
            : submitLabel;

    const processedSubmitLabel =
        customSubmitLabel != null ? t(customSubmitLabel) : defaultSubmitLabel;

    const handlePrimaryActionClick = () => {
        if (displayCompletion) {
            completion?.onClick?.();
            return;
        }

        if (displaySuccessLink) {
            close();
            successOnClick?.(txReceipt!);
            return;
        }

        action?.({ onError });
    };

    const handleCancelClick = () => {
        if (isCustom) {
            onDismiss?.();
            return;
        }

        // The cancel button becomes a "Proceed anyway" navigation action during indexing after a timeout.
        // Only unblock navigation in that specific flow.
        if (showProceedAnyway) {
            setIsBlocked(false);
        }
        close();
        if (!showProceedAnyway) {
            onCancelClick?.();
        }
    };

    const processedSuccessLink =
        !isCustom && displaySuccessLink && successHref
            ? buildSuccessLink(successHref, {
                  receipt: txReceipt!,
                  slug: proposalSlug,
              })
            : undefined;
    const processedCompletionLink = displayCompletion
        ? completion?.href
        : undefined;

    // The cancel button becomes "Proceed anyway" during indexing after 8 seconds
    // and navigates the user to a different page based on transaction type.
    const cancelButtonLabel = showProceedAnyway
        ? t('app.shared.transactionDialog.footer.proceedAnyway')
        : t('app.shared.transactionDialog.footer.cancel');
    const fallbackUrl = indexingFallbackUrl ?? '/';

    return (
        <DialogFooter
            primaryAction={{
                label: processedSubmitLabel,
                onClick: handlePrimaryActionClick,
                iconLeft:
                    !displayCompletion && (isErrorState || isWarningState)
                        ? IconType.RELOAD
                        : undefined,
                isLoading: !displayCompletion && isPendingState,
                disabled: primaryActionDisabled,
                href: processedCompletionLink ?? processedSuccessLink,
            }}
            secondaryAction={{
                label: cancelButtonLabel,
                onClick: handleCancelClick,
                href: !isCustom && showProceedAnyway ? fallbackUrl : undefined,
                disabled: isCustom
                    ? isCancelDisabled
                    : showProceedAnyway
                      ? isSuccessState
                      : isCancelDisabled,
            }}
        />
    );
};
