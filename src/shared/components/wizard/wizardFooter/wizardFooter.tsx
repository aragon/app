import { AlertCard, Button, IconType } from '@aragon/gov-ui-kit';
import { type FieldErrors, type FieldValues, useFormContext } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import { useWizardContext } from '../wizardProvider';

const getValidationError = <TFormFields extends FieldValues = FieldValues>(errors: FieldErrors<TFormFields>) => {
    const requiredErrors = Object.keys(errors).filter((key) => errors[key]?.type === 'required');
    const invalidErrors = Object.keys(errors).filter((key) => errors[key]?.type !== 'required');

    if (!requiredErrors.length && !invalidErrors.length) {
        return undefined;
    }

    return requiredErrors.length > 0 && invalidErrors.length > 0
        ? 'invalid-required'
        : requiredErrors.length > 0
          ? 'required'
          : 'invalid';
};

export interface IWizardFooterProps {
    /**
     * ID of the form to be used when the submit button is placed outside the form.
     */
    formId?: string;
}

export const WizardFooter: React.FC<IWizardFooterProps> = (props) => {
    const { formId } = props;

    const { submitLabel, hasNext, hasPrevious, previousStep } = useWizardContext();

    const { t } = useTranslations();
    const { formState } = useFormContext();
    const { isSubmitted, errors } = formState;

    const validationError = getValidationError(errors);
    const displayValidationError = isSubmitted && validationError != null;

    const submitButtonVariant = displayValidationError ? 'critical' : !hasNext ? 'primary' : 'secondary';
    const submitButtonLabel = hasNext ? t('app.shared.wizard.step.next') : submitLabel;

    return (
        <div className="flex flex-col gap-6">
            {displayValidationError && (
                <AlertCard
                    message={t(`app.shared.wizard.step.error.${validationError}.title`)}
                    description={t(`app.shared.wizard.step.error.${validationError}.description`)}
                    variant="critical"
                />
            )}
            <div className="flex flex-row justify-between">
                <Button
                    className={!hasPrevious ? 'invisible' : undefined}
                    iconLeft={IconType.CHEVRON_LEFT}
                    onClick={previousStep}
                    variant="tertiary"
                    size="lg"
                >
                    {t('app.shared.wizard.step.back')}
                </Button>
                <Button
                    iconRight={IconType.CHEVRON_RIGHT}
                    variant={submitButtonVariant}
                    size="lg"
                    type="submit"
                    form={formId}
                >
                    {submitButtonLabel}
                </Button>
            </div>
        </div>
    );
};
