import { useStepper } from '@/shared/hooks/useStepper';
import { Progress } from '@aragon/ods';
import { DevTool } from '@hookform/devtools';
import { useMemo, type ComponentProps } from 'react';
import { FormProvider, useForm, type FieldValues, type UseFormProps } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import { WizardProvider, type IWizardStepperStep } from '../wizardProvider';

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
    /**
     * Default values for the form.
     */
    defaultValues?: UseFormProps<TFormData>['defaultValues'];
}

export const WizardContainer = <TFormData extends FieldValues = FieldValues>(
    props: IWizardContainerProps<TFormData>,
) => {
    const { initialSteps = [], finalStep, children, onSubmit, submitLabel, defaultValues, ...otherProps } = props;

    const { t } = useTranslations();
    const formMethods = useForm<TFormData>({ mode: 'onTouched', defaultValues });

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
                    className="flex h-full flex-col gap-4 md:gap-6"
                    onSubmit={formMethods.handleSubmit(handleSubmit)}
                    {...otherProps}
                >
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
                    {children}
                </form>
            </WizardProvider>
            <DevTool control={formMethods.control} />
        </FormProvider>
    );
};
