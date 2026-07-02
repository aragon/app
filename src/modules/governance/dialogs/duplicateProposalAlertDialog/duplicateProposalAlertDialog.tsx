import { DialogAlert, DialogAlertFooter, invariant } from '@aragon/gov-ui-kit';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDuplicateProposalAlertDialogProps } from './duplicateProposalAlertDialog.api';

const namespace = 'app.governance.duplicateProposalAlertDialog';

export const DuplicateProposalAlertDialog: React.FC<
    IDuplicateProposalAlertDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'DuplicateProposalAlertDialog: required parameters must be set.',
    );

    const { onProceed, onResume } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const handleProceed = () => {
        close();
        onProceed();
    };

    const handleResume = () => {
        close();
        onResume?.();
    };

    // "New transaction" is the warning (yellow) action on the right. The subdued choice resumes the
    // existing transaction when we can reopen it, otherwise it simply dismisses the warning.
    const cancelButton =
        onResume != null
            ? { label: t(`${namespace}.action.resume`), onClick: handleResume }
            : { label: t(`${namespace}.action.back`), onClick: () => close() };

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
                    label: t(`${namespace}.action.new`),
                    onClick: handleProceed,
                }}
                cancelButton={cancelButton}
            />
        </>
    );
};
