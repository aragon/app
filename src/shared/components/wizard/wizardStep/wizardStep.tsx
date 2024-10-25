import { AlertCard, Button, Heading, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useEffect, type ComponentProps } from 'react';
import { useFormContext, type FieldErrors, type FieldValues } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import { useWizardContext } from '../wizardProvider';
import type { IWizardStepperStep } from '../wizardProvider/wizardProvider';

export interface IWizardStepProps extends IWizardStepperStep, Omit<ComponentProps<'div'>, 'id'> {
    /**
     * Title of the step.
     */
    title: string;
    /**
     * Description of the step.
     */
    description: string;
    /**
     * Hides the step when set to true.
     */
    hidden?: boolean;
}

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

export const WizardStep = <TFormFields extends FieldValues = FieldValues>(props: IWizardStepProps) => {
    const { title, description, id, hidden, meta, order, children, className, ...otherProps } = props;

    const { submitLabel, activeStep, hasNext, hasPrevious, previousStep, registerStep, unregisterStep } =
        useWizardContext();

    const { t } = useTranslations();
    const { formState } = useFormContext<TFormFields>();
    const { isSubmitted, errors } = formState;

    const validationError = getValidationError(errors);
    const displayValidationError = isSubmitted && validationError != null;

    const submitButtonVariant = displayValidationError ? 'critical' : !hasNext ? 'primary' : 'secondary';
    const submitButtonLabel = hasNext ? t('app.shared.wizard.step.next') : submitLabel;

    useEffect(() => {
        if (hidden) {
            unregisterStep(id);
        } else {
            registerStep({ id, order, meta });
        }
    }, [hidden, unregisterStep, registerStep, id, order, meta]);

    useEffect(() => {
        if (activeStep === id) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeStep, id]);

    if (activeStep !== id) {
        return null;
    }

    return (
        <div className={classNames('flex h-full flex-col justify-between gap-10 md:gap-20', className)} {...otherProps}>
            <div className="flex flex-col gap-6 md:gap-12">
                <div className="flex flex-col gap-2">
                    <Heading size="h1">{title}</Heading>
                    <p className="text-base font-normal leading-normal text-neutral-500 md:text-lg">{description}</p>
                </div>
                {children}
            </div>
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
                    <Button iconRight={IconType.CHEVRON_RIGHT} variant={submitButtonVariant} size="lg" type="submit">
                        {submitButtonLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};
