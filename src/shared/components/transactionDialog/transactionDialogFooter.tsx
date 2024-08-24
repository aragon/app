import { DialogFooter, IconType } from '@aragon/ods';
import { useDialogContext } from '../dialogProvider';
import { type TransactionStatusState } from '../transactionStatus';
import { useTranslations } from '../translationsProvider';
import {
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    TransactionDialogStep,
} from './transactionDialog.api';

export interface ITransactionDialogFooterProps<TCustomStepId> {
    /**
     * Label to be used by default for the submit button.
     */
    submitLabel: string;
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

export const TransactionDialogFooter = <TCustomStepId extends string>(
    props: ITransactionDialogFooterProps<TCustomStepId>,
) => {
    const { submitLabel, activeStep, onError } = props;

    const { id: stepId, meta } = activeStep ?? {};
    const { state, action } = meta ?? {};

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const isErrorState = state === 'error';
    const isSuccessState = state === 'success';

    const isCancelDisabled = stepId === TransactionDialogStep.CONFIRM && (isSuccessState || isErrorState);

    const customSubmitLabel = stepId != null && state != null ? stepStateSubmitLabel[stepId]?.[state] : undefined;
    const defaultSubmitLabel = isErrorState ? t('app.shared.transactionDialog.footer.retry') : submitLabel;

    const processedSubmitLabel = customSubmitLabel != null ? t(customSubmitLabel) : defaultSubmitLabel;

    return (
        <DialogFooter
            primaryAction={{
                label: processedSubmitLabel,
                onClick: () => action?.({ onError }),
                iconLeft: isErrorState ? IconType.RELOAD : undefined,
                isLoading: state === 'pending',
            }}
            secondaryAction={{
                label: t('app.shared.transactionDialog.footer.cancel'),
                onClick: close,
                disabled: isCancelDisabled,
            }}
        />
    );
};
