import type { ComponentProps, FormEvent } from 'react';
import {
    type FieldErrors,
    type FieldValues,
    useFormContext,
} from 'react-hook-form';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import { useWizardContext } from '../wizardProvider';

export interface IWizardFormProps<TFormData extends FieldValues = FieldValues>
    extends Omit<ComponentProps<'form'>, 'onSubmit'> {
    /**
     * Callback called at the end of the wizard with the form data when the form is valid.
     */
    onSubmit?: (data: TFormData) => void;
}

export const WizardForm = <TFormData extends FieldValues = FieldValues>(
    props: IWizardFormProps<TFormData>,
) => {
    const { children, onSubmit = () => null, ...otherProps } = props;

    const { activeStep, activeStepIndex, analytics, hasNext, nextStep } =
        useWizardContext();
    const { handleSubmit } = useFormContext<TFormData>();

    const handleInvalidSubmit = (errors: FieldErrors<TFormData>) => {
        if (analytics == null || activeStep == null) {
            return;
        }

        plausibleAnalyticsUtils.track('wizard_validation_blocked', {
            ...analytics.props,
            flow: analytics.flow,
            stepKey: activeStep,
            stepIndex: activeStepIndex,
            attempt: hasNext ? 'next' : 'submit',
            errorCount: Object.keys(errors).length,
        });
    };

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const submitCallback = hasNext ? nextStep : onSubmit;
        void handleSubmit(submitCallback, handleInvalidSubmit)(event);
    };

    return (
        <form onSubmit={handleFormSubmit} {...otherProps}>
            {children}
        </form>
    );
};
