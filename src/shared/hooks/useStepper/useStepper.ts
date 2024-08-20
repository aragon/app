import { type IStepperStep, StepperUtils } from '@/shared/utils/stepperUtils';
import { useCallback, useMemo, useState } from 'react';
import type { IUseStepperParams, IUseStepperReturn } from './useStepper.api';

export const useStepper = <TMeta>(params?: IUseStepperParams<TMeta>): IUseStepperReturn<TMeta> => {
    const { initialSteps, initialActiveStep } = params ?? {};

    const stepperUtils = useMemo(
        () => new StepperUtils(initialSteps, initialActiveStep),
        [initialSteps, initialActiveStep],
    );

    const [steps, setSteps] = useState<Array<IStepperStep<TMeta>>>(stepperUtils.getSteps());
    const [activeStep, setActiveStep] = useState<string | undefined>(stepperUtils.getActiveStep());

    const registerStep = useCallback(
        (newStep: IStepperStep<TMeta>) => setSteps(stepperUtils.addStep(newStep)),
        [stepperUtils],
    );

    const unregisterStep = useCallback((stepId: string) => setSteps(stepperUtils.removeStep(stepId)), [stepperUtils]);

    const nextStep = useCallback(() => setActiveStep(stepperUtils.next()), [setActiveStep, stepperUtils]);

    const previousStep = useCallback(() => setActiveStep(stepperUtils.previous()), [setActiveStep, stepperUtils]);

    const updateActiveStep = useCallback(
        (stepId: string) => setActiveStep(stepperUtils.setActiveStep(stepId)),
        [stepperUtils],
    );

    return {
        steps,
        activeStep,
        activeStepIndex: stepperUtils.findStepIndex(activeStep),
        hasNext: stepperUtils.hasNext(),
        hasPrevious: stepperUtils.hasPrevious(),
        registerStep,
        unregisterStep,
        nextStep,
        previousStep,
        updateActiveStep,
    };
};
