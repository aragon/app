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

    const { onProceed } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const handleProceed = () => {
        close();
        onProceed();
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
            {/* "Publish again" is the warning (yellow) action and, for a warning alert, renders on the
                right; "Go back" is the subdued/safe choice. */}
            <DialogAlertFooter
                actionButton={{
                    label: t(`${namespace}.action.publish`),
                    onClick: handleProceed,
                }}
                cancelButton={{
                    label: t(`${namespace}.action.back`),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
