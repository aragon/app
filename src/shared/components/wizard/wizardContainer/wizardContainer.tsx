import { useConfirmWizardExit } from '@/shared/hooks/useConfirmWizardExit';
import { useStepper } from '@/shared/hooks/useStepper';
import { Progress } from '@aragon/ods';
import dynamic from 'next/dynamic';
import { ElementType, useEffect, useMemo, type ComponentProps } from 'react';
import { FormProvider, useForm, type FieldValues, type UseFormProps } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import { WizardProvider, type IWizardStepperStep } from '../wizardProvider';

// Dynamically import react-hook-form dev-tools to avoid NextJs hydration errors
const DevTool: ElementType = dynamic(() => import('@hookform/devtools').then((module) => module.DevTool), {
    ssr: false,
});

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
    const { formState, reset, handleSubmit, control } = formMethods;

    const wizardStepper = useStepper({ initialSteps });
    const { hasNext, activeStepIndex, steps } = wizardStepper;

    const handleFormSubmit = (values: TFormData) => {
        if (wizardStepper.hasNext) {
            wizardStepper.nextStep();
        } else {
            onSubmit?.(values);
        }
    };

    // Reset submitted form state to only display validation alerts when user clicks again on "next" button
    useEffect(() => {
        if (formState.isSubmitSuccessful && wizardStepper.hasNext) {
            reset(undefined, { keepDirty: true, keepValues: true });
        }
    }, [formState, reset, wizardStepper.hasNext]);

    const wizardContextValues = useMemo(() => ({ ...wizardStepper, submitLabel }), [wizardStepper, submitLabel]);

    const nextStepName = hasNext ? steps[activeStepIndex + 1].meta.name : finalStep;
    const wizardProgress = ((activeStepIndex + 1) * 100) / steps.length;

    useConfirmWizardExit(formState.isDirty);

    return (
        <FormProvider {...formMethods}>
            <WizardProvider value={wizardContextValues}>
                <form
                    className="flex h-full flex-col gap-4 md:gap-6"
                    onSubmit={handleSubmit(handleFormSubmit)}
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
            <DevTool control={control} />
        </FormProvider>
    );
};
