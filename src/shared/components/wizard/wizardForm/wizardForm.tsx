import { Progress } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps, FormEvent } from 'react';
import { useFormContext, type FieldValues } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import { useWizardContext } from '../wizardProvider';

export interface IWizardFormProps<TFormData extends FieldValues = FieldValues>
    extends Omit<ComponentProps<'form'>, 'onSubmit'> {
    /**
     * Name of the final step. The "next" label is hidden when not set.
     */
    finalStep?: string;
    /**
     * Callback called at the end of the wizard with the form data when the form is valid.
     */
    onSubmit?: (data: TFormData) => void;
    /**
     * Displays the current stepper progress when set to true.
     * @default true
     */
    displayProgress?: boolean;
}

export const WizardForm = <TFormData extends FieldValues = FieldValues>(props: IWizardFormProps<TFormData>) => {
    const { finalStep, children, onSubmit = () => null, displayProgress = true, className, ...otherProps } = props;
    const { t } = useTranslations();

    const { steps, activeStepIndex, hasNext, nextStep } = useWizardContext();
    const { handleSubmit } = useFormContext<TFormData>();

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const submitCallback = hasNext ? nextStep : onSubmit;
        void handleSubmit(submitCallback)(event);
    };

    const nextStepName = hasNext ? steps[activeStepIndex + 1].meta.name : finalStep;
    const wizardProgress = ((activeStepIndex + 1) * 100) / steps.length;

    return (
        <form
            className={classNames('flex h-full flex-col gap-4 md:gap-6', className)}
            onSubmit={handleFormSubmit}
            {...otherProps}
        >
            {displayProgress && (
                <div className="flex flex-col gap-1.5 md:gap-3">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-row gap-1 text-base font-normal leading-tight">
                            <span className="text-primary-400">
                                {t('app.shared.wizard.container.step', { number: activeStepIndex + 1 })}
                            </span>
                            <span className="text-neutral-500">
                                {t('app.shared.wizard.container.total', { total: steps.length })}
                            </span>
                        </div>
                        {nextStepName != null && (
                            <div className="flex flex-row gap-1 text-base font-normal leading-tight">
                                <span className="text-neutral-500">{t('app.shared.wizard.container.next')}</span>
                                <span className="text-neutral-800">{nextStepName}</span>
                            </div>
                        )}
                    </div>
                    <Progress value={wizardProgress} variant="primary" size="sm" />
                </div>
            )}
            {children}
        </form>
    );
};
