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
    const { hasPrevious, previousStep } = useWizardContext();
    const { displayValidationError, submitLabel } = useWizardFooter();

    const secondaryAction = {
        label: t('app.shared.wizardDialog.container.back'),
        onClick: previousStep,
    };

    return (
        <Dialog.Footer
            hasError={displayValidationError}
            variant="wizard"
            primaryAction={{ label: submitLabel, type: 'submit', form: formId }}
            secondaryAction={hasPrevious ? secondaryAction : undefined}
        />
    );
};
