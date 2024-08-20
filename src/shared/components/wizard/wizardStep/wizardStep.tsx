import { AlertCard, Button, Heading, IconType } from '@aragon/ods';
import classNames from 'classnames';
import { useEffect, type ComponentProps } from 'react';
import { useFormContext, type FieldErrors } from 'react-hook-form';
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

const getValidationError = (errors: FieldErrors) => {
    const requiredErrors = Object.keys(errors).map((key) => errors[key]?.type === 'required');
    const invalidErrors = Object.keys(errors).map((key) => errors[key]?.type !== 'required');

    if (!requiredErrors.length && !invalidErrors.length) {
        return undefined;
    }

    return requiredErrors.length > 0 && invalidErrors.length > 0
        ? 'invalid-required'
        : requiredErrors.length > 0
          ? 'required'
          : 'invalid';
};

export const WizardStep: React.FC<IWizardStepProps> = (props) => {
    const { title, description, id, hidden, meta, order, children, className, ...otherProps } = props;

    const { submitLabel, activeStep, hasNext, hasPrevious, previousStep, registerStep, unregisterStep } =
        useWizardContext();

    const { t } = useTranslations();
    const { formState } = useFormContext();
    const { isSubmitted, errors } = formState;

    const validationError = getValidationError(errors);
    const displayValidationError = isSubmitted && validationError != null;
    const submitButtonVariant = displayValidationError ? 'critical' : !hasNext ? 'primary' : 'tertiary';

    useEffect(() => {
        if (hidden) {
            unregisterStep(id);
        } else {
            registerStep({ id, order, meta });
        }
    }, [hidden, unregisterStep, registerStep, id, order, meta]);

    const submitButtonLabel = hasNext ? t('app.shared.wizard.step.next') : submitLabel;

    if (activeStep !== id) {
        return null;
    }

    return (
        <div className={classNames('flex h-full flex-col justify-between gap-20', className)} {...otherProps}>
            <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-2">
                    <Heading size="h1">{title}</Heading>
                    <p className="text-lg font-normal leading-normal text-neutral-500">{description}</p>
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
                        size="md"
                    >
                        {t('app.shared.wizard.step.back')}
                    </Button>
                    <Button iconRight={IconType.CHEVRON_RIGHT} variant={submitButtonVariant} size="md" type="submit">
                        {submitButtonLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};
