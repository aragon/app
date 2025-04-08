import { type IStepperStep, StepperUtils } from '@/shared/utils/stepperUtils';
import { useCallback, useMemo, useState } from 'react';
import type { IUseStepperParams, IUseStepperReturn } from './useStepper.api';

export const useStepper = <TMeta, TStepId extends string = string>(
    params?: IUseStepperParams<TMeta, TStepId>,
): IUseStepperReturn<TMeta, TStepId> => {
    const { initialSteps, initialActiveStep, multistep } = params ?? {};

    const stepperUtils = useMemo(
        () => new StepperUtils(initialSteps, initialActiveStep),
        [initialSteps, initialActiveStep],
    );

    const [steps, setSteps] = useState<Array<IStepperStep<TMeta, TStepId>>>(stepperUtils.getSteps());
    const [activeStep, setActiveStep] = useState<TStepId | undefined>(stepperUtils.getActiveStep());

    const registerStep = useCallback(
        (newStep: IStepperStep<TMeta, TStepId>) => setSteps(stepperUtils.addStep(newStep)),
        [stepperUtils],
    );

    const unregisterStep = useCallback((stepId: TStepId) => setSteps(stepperUtils.removeStep(stepId)), [stepperUtils]);

    const nextStep = useCallback(() => setActiveStep(stepperUtils.next()), [setActiveStep, stepperUtils]);

    const previousStep = useCallback(() => setActiveStep(stepperUtils.previous()), [setActiveStep, stepperUtils]);

    const updateActiveStep = useCallback(
        (stepId: TStepId) => setActiveStep(stepperUtils.setActiveStep(stepId)),
        [stepperUtils],
    );

    const updateSteps = useCallback(
        (steps: Array<IStepperStep<TMeta, TStepId>>) => setSteps(stepperUtils.setSteps(steps)),
        [stepperUtils],
    );

    return {
        steps,
        multistep,
        activeStep,
        activeStepIndex: stepperUtils.findStepIndex(activeStep),
        hasNext: stepperUtils.hasNext(),
        hasPrevious: stepperUtils.hasPrevious(),
        registerStep,
        unregisterStep,
        nextStep,
        previousStep,
        updateActiveStep,
        updateSteps,
    };
};
