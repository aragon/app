import { Dialog } from '@aragon/gov-ui-kit';
import { useWizardContext } from '../../wizard';

export interface IWizardDialogContainerFooterProps {
    /**
     * ID of the form to link the submit button to the form element.
     */
    formId: string;
}

export const WizardDialogContainerFooter: React.FC<IWizardDialogContainerFooterProps> = (props) => {
    const { formId } = props;

    const { hasPrevious, previousStep, submitLabel } = useWizardContext();

    return (
        <Dialog.Footer
            // hasError={displayValidationError}
            // @ts-expect-error TODO: update primary action props to support form
            primaryAction={{ label: submitLabel, type: 'submit', form: formId }}
            secondaryAction={hasPrevious ? { label: 'Back', onClick: previousStep } : undefined}
        />
    );
};
