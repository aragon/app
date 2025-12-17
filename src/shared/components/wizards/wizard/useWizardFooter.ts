import type { ButtonVariant } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { type FieldErrors, useFormContext } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import { useWizardContext } from './wizardProvider';

const getValidationStatus = (errors: FieldErrors) => {
    const requiredErrors = Object.keys(errors).filter((key) => errors[key]?.type === 'required');
    const invalidErrors = Object.keys(errors).filter((key) => errors[key]?.type !== 'required');

    if (!(requiredErrors.length || invalidErrors.length)) {
        return 'valid';
    }

    if (requiredErrors.length > 0 && invalidErrors.length > 0) {
        return 'invalid-required';
    }
    if (requiredErrors.length > 0) {
        return 'required';
    }
    return 'invalid';
};

export interface IUseWizardFooterReturn {
    /**
     * String representing the current form validation status.
     */
    validationStatus: string;
    /**
     * Defines if the form should display a validation error or not.
     */
    displayValidationError: boolean;
    /**
     * Variant of the submit button.
     */
    submitVariant: ButtonVariant;
    /**
     * Label of the submit button.
     */
    submitLabel: string;
    /**
     * Help text to be displayed under the submit button at the end of the wizard.
     */
    submitHelpText?: string;
    /**
     * Callback to be triggered to navigate to a previous step.
     */
    onPreviousClick: () => void;
}

export const useWizardFooter = (): IUseWizardFooterReturn => {
    const { t } = useTranslations();
    const { submitLabel, hasNext, previousStep, submitHelpText } = useWizardContext();

    const { formState, clearErrors } = useFormContext();
    const { isSubmitted, errors } = formState;

    const validationStatus = getValidationStatus(errors);
    const displayValidationError = isSubmitted && validationStatus !== 'valid';

    let submitVariant: ButtonVariant = 'primary';
    if (displayValidationError) {
        submitVariant = 'critical';
    } else if (hasNext) {
        submitVariant = 'secondary';
    }
    const processedSubmitLabel = hasNext ? t('app.shared.wizard.footer.next') : submitLabel;
    const processedSubmitHelpText = hasNext ? undefined : submitHelpText;

    const onPreviousClick = useCallback(() => {
        // Clear form errors when going on a previous step to avoid displaying validation error for next steps
        clearErrors();
        previousStep();
    }, [clearErrors, previousStep]);

    return {
        validationStatus,
        displayValidationError,
        submitVariant,
        submitLabel: processedSubmitLabel,
        submitHelpText: processedSubmitHelpText,
        onPreviousClick,
    };
};
