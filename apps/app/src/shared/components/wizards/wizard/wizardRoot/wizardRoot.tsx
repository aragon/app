import dynamic from 'next/dynamic';
import {
    type ElementType,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import {
    type FieldValues,
    FormProvider,
    type UseFormProps,
    useForm,
} from 'react-hook-form';
import { useConfirmWizardExit } from '@/shared/hooks/useConfirmWizardExit';
import { useStepper } from '@/shared/hooks/useStepper';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import {
    type IWizardAnalytics,
    type IWizardStepperStep,
    WizardProvider,
} from '../wizardProvider';

// Dynamically import react-hook-form dev-tools to avoid NextJs hydration errors
const DevTool: ElementType = dynamic(
    () => import('@hookform/devtools').then((module) => module.DevTool),
    {
        ssr: false,
    },
);

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
     * Optional analytics metadata for stepper-level product telemetry.
     */
    analytics?: IWizardAnalytics;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const WizardRoot = <TFormData extends FieldValues = FieldValues>(
    props: IWizardRootProps<TFormData>,
) => {
    const {
        initialSteps,
        children,
        submitLabel,
        defaultValues,
        useDevTool,
        submitHelpText,
        analytics,
    } = props;

    const formMethods = useForm<TFormData>({
        mode: 'onTouched',
        defaultValues,
    });
    const { formState, reset, control } = formMethods;

    const wizardStepper = useStepper({ initialSteps });
    const previousStepRef = useRef<
        | {
              id?: string;
              index: number;
          }
        | undefined
    >(undefined);
    const hasTrackedStartRef = useRef(false);
    const activeStep = wizardStepper.activeStep;
    const activeStepIndex = wizardStepper.activeStepIndex;
    const analyticsFlow = analytics?.flow;
    const analyticsPropsKey = JSON.stringify(analytics?.props ?? null);
    const stableAnalytics = useMemo(() => {
        if (analyticsFlow == null) {
            return undefined;
        }

        return {
            flow: analyticsFlow,
            props:
                analyticsPropsKey === 'null'
                    ? undefined
                    : (JSON.parse(
                          analyticsPropsKey,
                      ) as IWizardAnalytics['props']),
        };
    }, [analyticsFlow, analyticsPropsKey]);

    useEffect(() => {
        if (stableAnalytics == null || activeStep == null) {
            return;
        }

        const baseProps = {
            ...stableAnalytics.props,
            flow: stableAnalytics.flow,
        };

        if (!hasTrackedStartRef.current) {
            hasTrackedStartRef.current = true;
            plausibleAnalyticsUtils.track('wizard_start', baseProps);
        }

        if (previousStepRef.current?.id === activeStep) {
            return;
        }

        const previousStep = previousStepRef.current;
        const direction =
            previousStep == null
                ? 'direct'
                : activeStepIndex > previousStep.index
                  ? 'forward'
                  : activeStepIndex < previousStep.index
                    ? 'back'
                    : 'direct';

        previousStepRef.current = { id: activeStep, index: activeStepIndex };
        plausibleAnalyticsUtils.track('wizard_step', {
            ...baseProps,
            stepKey: activeStep,
            stepIndex: activeStepIndex,
            direction,
        });
    }, [stableAnalytics, activeStep, activeStepIndex]);

    // Reset submitted form state to only display validation alerts when user clicks again on "next" button
    useEffect(() => {
        if (formState.isSubmitSuccessful) {
            reset(undefined, { keepDirty: true, keepValues: true });
        }
    }, [formState, reset]);

    const wizardContextValues = useMemo(
        () => ({
            ...wizardStepper,
            analytics: stableAnalytics,
            submitLabel,
            submitHelpText,
        }),
        [wizardStepper, stableAnalytics, submitLabel, submitHelpText],
    );

    useConfirmWizardExit(formState.isDirty);

    return (
        <FormProvider {...formMethods}>
            <WizardProvider value={wizardContextValues}>
                {children}
            </WizardProvider>
            {useDevTool && <DevTool control={control} />}
        </FormProvider>
    );
};
