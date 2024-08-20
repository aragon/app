import { useStepper } from '@/shared/hooks/useStepper';
import { Progress } from '@aragon/ods';
import { useMemo, type ComponentProps } from 'react';
import { FormProvider, useForm, type FieldValues } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import { WizardProvider } from '../wizardProvider';
import type { IWizardStepperStep } from '../wizardProvider/wizardProvider';

export interface IWizardContainerProps<TFormData extends FieldValues = FieldValues>
    extends Omit<ComponentProps<'form'>, 'onSubmit'> {
    /**
     * Initial steps of the wizard used to populate the steps array.
     */
    initialSteps?: IWizardStepperStep[];
    /**
     * Name of the final step. The "next" label is hidden when not set.
     */
    finalStep?: string;
    /**
     * Label for the submit button at the end of the wizard.
     */
    submitLabel: string;
    /**
     * Callback called at the end of the wizard with the form data when the form is valid.
     */
    onSubmit?: (data: TFormData) => void;
}

export const WizardContainer = <TFormData extends FieldValues = FieldValues>(
    props: IWizardContainerProps<TFormData>,
) => {
    const { initialSteps = [], finalStep, children, onSubmit, submitLabel, ...otherProps } = props;

    const { t } = useTranslations();
    const formMethods = useForm<TFormData>({ mode: 'onTouched' });

    const wizardStepper = useStepper({ initialSteps });
    const { hasNext, activeStepIndex, steps } = wizardStepper;

    const handleSubmit = (values: TFormData) => {
        if (wizardStepper.hasNext) {
            wizardStepper.nextStep();
        } else {
            onSubmit?.(values);
        }
    };

    const wizardContextValues = useMemo(() => ({ ...wizardStepper, submitLabel }), [wizardStepper, submitLabel]);

    const nextStepName = hasNext ? steps[activeStepIndex + 1].meta.name : finalStep;
    const wizardProgress = ((activeStepIndex + 1) * 100) / steps.length;

    return (
        <FormProvider {...formMethods}>
            <WizardProvider value={wizardContextValues}>
                <form
                    className="flex h-full flex-col gap-6"
                    onSubmit={formMethods.handleSubmit(handleSubmit)}
                    {...otherProps}
                >
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-row justify-between">
                            <p className="text-base font-normal leading-tight">
                                <span className="text-primary-400">
                                    {t('app.shared.wizard.container.step', { number: activeStepIndex + 1 })}
                                </span>
                                <span className="text-neutral-500">
                                    {t('app.shared.wizard.container.total', { total: steps.length })}
                                </span>
                            </p>
                            {nextStepName != null && (
                                <p className="text-base font-normal leading-tight">
                                    <span className="text-neutral-500">{t('app.shared.wizard.container.next')}</span>
                                    <span className="text-neutral-800">{` ${nextStepName}`}</span>
                                </p>
                            )}
                        </div>
                        <Progress value={wizardProgress} variant="primary" size="sm" />
                    </div>
                    {children}
                </form>
            </WizardProvider>
        </FormProvider>
    );
};
