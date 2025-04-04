import type { TransactionType } from '@/shared/api/transactionService';
import { DialogFooter, IconType } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import type { TransactionReceipt } from 'viem';
import { useBlockNavigationContext } from '../blockNavigationContext';
import { useDialogContext } from '../dialogProvider';
import { type TransactionStatusState } from '../transactionStatus';
import { useTranslations } from '../translationsProvider';
import {
    type IBuildTransactionDialogSuccessLinkHref,
    type ITransactionDialogActionParams,
    type ITransactionDialogProps,
    type ITransactionDialogStep,
    TransactionDialogStep,
    type TransactionDialogSuccessLinkHref,
} from './transactionDialog.api';

export interface ITransactionDialogFooterProps<TCustomStepId extends string = string> {
    /**
     * Label to be used by default for the submit button.
     */
    submitLabel: string;
    /**
     * Link displayed when the transaction has been sent successfully.
     */
    successLink: ITransactionDialogProps['successLink'];
    /**
     * Receipt of the transaction used for building the success link.
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
     * Callback called on cancel button click.
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
}

const stepStateSubmitLabel: Partial<Record<TransactionDialogStep, Partial<Record<TransactionStatusState, string>>>> = {
    [TransactionDialogStep.APPROVE]: {
        idle: 'app.shared.transactionDialog.footer.approve.idle',
        pending: 'app.shared.transactionDialog.footer.approve.pending',
        error: 'app.shared.transactionDialog.footer.approve.error',
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

const indexingStepTimeout = 8000;

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
    } = props;

    const { label: successLabel, href: successHref, onClick: successOnClick } = successLink;
    const { id: stepId, meta } = activeStep ?? {};
    const { state, action } = meta ?? {};

    const { setIsBlocked } = useBlockNavigationContext();

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const isIndexing = stepId === TransactionDialogStep.INDEXING;

    const [showProceedAnyway, setShowProceedAnyway] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isIndexing && state === 'pending') {
            timer = setTimeout(() => setShowProceedAnyway(true), indexingStepTimeout);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [isIndexing, state]);

    const isErrorState = state === 'error';
    const isSuccessState = state === 'success';
    const isPendingState = state === 'pending';

    const successStep = transactionType ? TransactionDialogStep.INDEXING : TransactionDialogStep.CONFIRM;

    const displaySuccessLink = stepId === successStep && isSuccessState;
    const isCancelDisabled =
        (stepId === TransactionDialogStep.CONFIRM || stepId === TransactionDialogStep.INDEXING) &&
        (isSuccessState || isPendingState) &&
        !showProceedAnyway;

    const customSubmitLabel = stepId != null && state != null ? stepStateSubmitLabel[stepId]?.[state] : undefined;
    const defaultSubmitLabel = isErrorState
        ? t('app.shared.transactionDialog.footer.retry')
        : displaySuccessLink
          ? successLabel
          : submitLabel;

    const processedSubmitLabel = customSubmitLabel != null ? t(customSubmitLabel) : defaultSubmitLabel;

    const handlePrimaryActionClick = () => {
        if (displaySuccessLink) {
            close();
            successOnClick?.(txReceipt!);
        } else {
            action?.({ onError });
        }
    };

    const handleCancelClick = () => {
        close();
        if (!showProceedAnyway) {
            onCancelClick?.();
        }
    };

    const processedSuccessLink =
        displaySuccessLink && successHref
            ? buildSuccessLink(successHref, { receipt: txReceipt!, slug: proposalSlug })
            : undefined;

    // The cancel button becomes "Proceed anyway" during indexing after 8 seconds
    // and navigates the user to a different page based on transaction type
    const cancelButtonLabel = showProceedAnyway
        ? t('app.shared.transactionDialog.footer.proceedAnyway')
        : t('app.shared.transactionDialog.footer.cancel');

    const getFallbackUrl = () => {
        setIsBlocked(false);
        return indexingFallbackUrl ?? '';
    };

    return (
        <DialogFooter
            primaryAction={{
                label: processedSubmitLabel,
                onClick: handlePrimaryActionClick,
                iconLeft: isErrorState ? IconType.RELOAD : undefined,
                isLoading: isPendingState,
                href: processedSuccessLink,
            }}
            secondaryAction={{
                label: cancelButtonLabel,
                onClick: handleCancelClick,
                href: showProceedAnyway ? getFallbackUrl() : undefined,
                disabled: isCancelDisabled,
            }}
        />
    );
};
