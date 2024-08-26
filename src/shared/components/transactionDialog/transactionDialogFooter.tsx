import { DialogFooter, IconType } from '@aragon/ods';
import type { TransactionReceipt } from 'viem';
import { useDialogContext } from '../dialogProvider';
import { type TransactionStatusState } from '../transactionStatus';
import { useTranslations } from '../translationsProvider';
import {
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
}

const stepStateSubmitLabel: Partial<Record<TransactionDialogStep, Partial<Record<TransactionStatusState, string>>>> = {
    [TransactionDialogStep.APPROVE]: {
        idle: 'app.shared.transactionDialog.footer.approve.idle',
        pending: 'app.shared.transactionDialog.footer.approve.pending',
        error: 'app.shared.transactionDialog.footer.approve.error',
    },
};

const buildSuccessLink = (successHref: TransactionDialogSuccessLinkHref, txReceipt?: TransactionReceipt) => {
    if (typeof successHref === 'string') {
        return successHref;
    }

    return txReceipt ? successHref(txReceipt) : undefined;
};

export const TransactionDialogFooter = <TCustomStepId extends string = string>(
    props: ITransactionDialogFooterProps<TCustomStepId>,
) => {
    const { submitLabel, successLink, txReceipt, activeStep, onError } = props;

    const { label: successLabel, href: successHref } = successLink;
    const { id: stepId, meta } = activeStep ?? {};
    const { state, action } = meta ?? {};

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const isErrorState = state === 'error';
    const isSuccessState = state === 'success';
    const isPendingState = state === 'pending';

    const displaySuccessLink = stepId === TransactionDialogStep.CONFIRM && isSuccessState;
    const isCancelDisabled = stepId === TransactionDialogStep.CONFIRM && (isSuccessState || isPendingState);

    const customSubmitLabel = stepId != null && state != null ? stepStateSubmitLabel[stepId]?.[state] : undefined;
    const defaultSubmitLabel = isErrorState
        ? t('app.shared.transactionDialog.footer.retry')
        : displaySuccessLink
          ? successLabel
          : submitLabel;

    const processedSubmitLabel = customSubmitLabel != null ? t(customSubmitLabel) : defaultSubmitLabel;

    const processedAction = displaySuccessLink ? close : () => action?.({ onError });
    const processedSuccessLink = displaySuccessLink ? buildSuccessLink(successHref, txReceipt) : undefined;

    return (
        <DialogFooter
            primaryAction={{
                label: processedSubmitLabel,
                onClick: processedAction,
                iconLeft: isErrorState ? IconType.RELOAD : undefined,
                isLoading: isPendingState,
                href: processedSuccessLink,
            }}
            secondaryAction={{
                label: t('app.shared.transactionDialog.footer.cancel'),
                onClick: close,
                disabled: isCancelDisabled,
            }}
        />
    );
};
