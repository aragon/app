import type { ButtonVariant } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { useFormContext, type FieldErrors } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import { useWizardContext } from './wizardProvider';

const getValidationStatus = (errors: FieldErrors) => {
    const requiredErrors = Object.keys(errors).filter((key) => errors[key]?.type === 'required');
    const invalidErrors = Object.keys(errors).filter((key) => errors[key]?.type !== 'required');

    if (!requiredErrors.length && !invalidErrors.length) {
        return 'valid';
    }

    return requiredErrors.length > 0 && invalidErrors.length > 0
        ? 'invalid-required'
        : requiredErrors.length > 0
          ? 'required'
          : 'invalid';
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
     * Callback to be triggered to navigate to a previous step.
     */
    onPreviousClick: () => void;
}

export const useWizardFooter = (): IUseWizardFooterReturn => {
    const { t } = useTranslations();
    const { submitLabel, hasNext, previousStep } = useWizardContext();

    const { formState, reset } = useFormContext();
    const { isSubmitted, errors } = formState;

    const validationStatus = getValidationStatus(errors);
    const displayValidationError = isSubmitted && validationStatus !== 'valid';

    const submitVariant = displayValidationError ? 'critical' : !hasNext ? 'primary' : 'secondary';
    const processedSubmitLabel = hasNext ? t('app.shared.wizard.footer.next') : submitLabel;

    const onPreviousClick = useCallback(() => {
        // Reset submitted status when going on a previous step to display validation error when submitting again
        reset(undefined, { keepDefaultValues: true, keepValues: true });
        previousStep();
    }, [reset, previousStep]);

    return {
        validationStatus,
        displayValidationError,
        submitVariant,
        submitLabel: processedSubmitLabel,
        onPreviousClick,
    };
};
