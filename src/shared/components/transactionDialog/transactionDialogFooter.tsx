import { DialogFooter, IconType } from '@aragon/ods';
import { useDialogContext } from '../dialogProvider';
import { type TransactionStatusState } from '../transactionStatus';
import { useTranslations } from '../translationsProvider';
import { type ITransactionDialogStep, TransactionDialogStep } from './transactionDialog.api';

const stepStateSubmitLabel: Partial<Record<TransactionDialogStep, Partial<Record<TransactionStatusState, string>>>> = {
    [TransactionDialogStep.APPROVE]: {
        idle: 'app.shared.transactionDialog.footer.approve.idle',
        pending: 'app.shared.transactionDialog.footer.approve.pending',
        error: 'app.shared.transactionDialog.footer.approve.error',
    },
};

export interface ITransactionDialogFooterProps<TCustomStepId> {
    /**
     * Label to be used by default for the submit button.
     */
    submitLabel: string;
    /**
     * Information about the current active step.
     */
    activeStep?: ITransactionDialogStep<TCustomStepId>;
}

export const TransactionDialogFooter = <TCustomStepId extends string>(
    props: ITransactionDialogFooterProps<TCustomStepId>,
) => {
    const { submitLabel, activeStep } = props;
    const { id, meta } = activeStep ?? {};

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const isErrorState = meta?.state === 'error';
    const isSuccessState = meta?.state === 'success';
    const isLoadingState = meta?.state === 'pending';

    const isCancelDisabled = id === TransactionDialogStep.CONFIRM && (isSuccessState || isErrorState);

    const customSubmitLabel = id != null && meta != null ? stepStateSubmitLabel[id]?.[meta.state] : undefined;
    const defaultSubmitLabel = isErrorState ? t('app.shared.transactionDialog.footer.retry') : submitLabel;

    const processedSubmitLabel = customSubmitLabel != null ? t(customSubmitLabel) : defaultSubmitLabel;

    return (
        <DialogFooter
            primaryAction={{
                label: processedSubmitLabel,
                onClick: activeStep?.meta.action,
                iconLeft: isErrorState ? IconType.RELOAD : undefined,
                isLoading: isLoadingState,
            }}
            secondaryAction={{
                label: t('app.shared.transactionDialog.footer.cancel'),
                onClick: close,
                disabled: isCancelDisabled,
            }}
        />
    );
};
