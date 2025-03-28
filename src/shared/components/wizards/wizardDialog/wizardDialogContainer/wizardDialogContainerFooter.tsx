import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog } from '@aragon/gov-ui-kit';
import { useWizardContext, useWizardFooter } from '../../wizard';

export interface IWizardDialogContainerFooterProps {
    /**
     * ID of the form to link the submit button to the form element.
     */
    formId: string;
    /**
     * Callback called on dialog close.
     */
    onClose: () => void;
}

export const WizardDialogContainerFooter: React.FC<IWizardDialogContainerFooterProps> = (props) => {
    const { formId, onClose } = props;

    const { t } = useTranslations();
    const { hasPrevious, previousStep } = useWizardContext();
    const { displayValidationError, submitLabel } = useWizardFooter();

    const secondaryActionLabel = hasPrevious ? 'back' : 'close';
    const secondaryAction = {
        label: t(`app.shared.wizardDialog.container.${secondaryActionLabel}`),
        onClick: hasPrevious ? previousStep : onClose,
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
