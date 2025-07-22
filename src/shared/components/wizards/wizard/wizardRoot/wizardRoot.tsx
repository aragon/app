import { useConfirmWizardExit } from '@/shared/hooks/useConfirmWizardExit';
import { useStepper } from '@/shared/hooks/useStepper';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, type ElementType, type ReactNode } from 'react';
import { FormProvider, useForm, type FieldValues, type UseFormProps } from 'react-hook-form';
import { WizardProvider, type IWizardStepperStep } from '../wizardProvider';

// Dynamically import react-hook-form dev-tools to avoid NextJs hydration errors
const DevTool: ElementType = dynamic(() => import('@hookform/devtools').then((module) => module.DevTool), {
    ssr: false,
});

export interface IWizardRootProps<TFormData extends FieldValues = FieldValues> {
    /**
     * Initial steps of the wizard used to populate the steps array.
     */
    initialSteps?: IWizardStepperStep[];
    /**
     * Label for the submit button at the end of the wizard.
     */
    submitLabel: string;
    /**
     * Help text to be displayed under the submit button at the end of the wizard.
     */
    submitHelpText?: string;
    /**
     * Default values for the form.
     */
    defaultValues?: UseFormProps<TFormData>['defaultValues'];
    /**
     * Renders the form library dev-tool when set to true.
     */
    useDevTool?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const WizardRoot = <TFormData extends FieldValues = FieldValues>(props: IWizardRootProps<TFormData>) => {
    const { initialSteps, children, submitLabel, defaultValues, useDevTool, submitHelpText } = props;

    const formMethods = useForm<TFormData>({ mode: 'onTouched', defaultValues });
    const { formState, reset, control } = formMethods;

    const wizardStepper = useStepper({ initialSteps });

    // Reset submitted form state to only display validation alerts when user clicks again on "next" button
    useEffect(() => {
        if (formState.isSubmitSuccessful) {
            reset(undefined, { keepDirty: true, keepValues: true });
        }
    }, [formState, reset]);

    const wizardContextValues = useMemo(
        () => ({ ...wizardStepper, submitLabel, submitHelpText }),
        [wizardStepper, submitLabel, submitHelpText],
    );

    useConfirmWizardExit(formState.isDirty);

    return (
        <FormProvider {...formMethods}>
            <WizardProvider value={wizardContextValues}>{children}</WizardProvider>
            {useDevTool && <DevTool control={control} />}
        </FormProvider>
    );
};
