import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog } from '@aragon/gov-ui-kit';
import { useWizardContext, useWizardFooter } from '../../wizard';

export interface IWizardDialogContainerFooterProps {
    /**
     * ID of the form to link the submit button to the form element.
     */
    formId: string;
}

export const WizardDialogContainerFooter: React.FC<IWizardDialogContainerFooterProps> = (props) => {
    const { formId } = props;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { hasPrevious } = useWizardContext();
    const { displayValidationError, submitLabel, onPreviousClick } = useWizardFooter();

    const secondaryActionLabel = hasPrevious ? 'back' : 'close';
    const secondaryAction = {
        label: t(`app.shared.wizardDialog.container.${secondaryActionLabel}`),
        onClick: hasPrevious ? onPreviousClick : () => close(),
    };

    return (
        <Dialog.Footer
            hasError={displayValidationError}
            variant="wizard"
            primaryAction={{ label: submitLabel, type: 'submit', form: formId }}
            secondaryAction={secondaryAction}
        />
    );
};
