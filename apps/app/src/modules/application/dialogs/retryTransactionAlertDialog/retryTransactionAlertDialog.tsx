import { DialogAlert, DialogAlertFooter, invariant } from '@aragon/gov-ui-kit';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IRetryTransactionAlertDialogProps } from './retryTransactionAlertDialog.api';

const namespace = 'app.application.retryTransactionAlertDialog';

export const RetryTransactionAlertDialog: React.FC<
    IRetryTransactionAlertDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'RetryTransactionAlertDialog: required parameters must be set.',
    );

    const { onRetry } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const handleRetry = () => {
        close(location.id);
        onRetry();
    };

    return (
        <>
            <DialogAlert.Header title={t(`${namespace}.title`)} />
            <DialogAlert.Content>
                <div className="flex flex-col gap-y-4 pb-4 font-normal text-base text-neutral-500 leading-normal">
                    <p>{t(`${namespace}.description.1`)}</p>
                    <p>{t(`${namespace}.description.2`)}</p>
                </div>
            </DialogAlert.Content>
            <DialogAlertFooter
                actionButton={{
                    label: t(`${namespace}.action.retry`),
                    onClick: handleRetry,
                }}
                cancelButton={{
                    label: t(`${namespace}.action.back`),
                    onClick: () => close(location.id),
                }}
            />
        </>
    );
};
