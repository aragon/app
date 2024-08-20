import type { IStepperStep } from '@/shared/utils/stepperUtils';

export interface IUseStepperParams<TMeta = undefined> {
    /**
     * Initial steps used to populate the steps array.
     */
    initialSteps?: Array<IStepperStep<TMeta>>;
    /**
     * Initial active step, defaults to the first element on the initialSteps array.
     */
    initialActiveStep?: string;
}

export interface IUseStepperReturn<TMeta = undefined> {
    /**
     * Array of steps ordered by order value.
     */
    steps: Array<IStepperStep<TMeta>>;
    /**
     * Current active step id.
     */
    activeStep?: string;
    /**
     * Index of the active step id inside the steps array. Defaults to -1 when there is no active step.
     */
    activeStepIndex: number;
    /**
     * Defines if the wizard has a next step or not.
     */
    hasNext: boolean;
    /**
     * Defines if the wizard has a previous step or not.
     */
    hasPrevious: boolean;
    /**
     * Registers the defined step at the specified order.
     */
    registerStep: (step: IStepperStep<TMeta>) => void;
    /**
     * Unregisters the step with the specified id.
     */
    unregisterStep: (stepId: string) => void;
    /**
     * Updates the active step to the next one on the step list. Does nothing when active step has no next step.
     */
    nextStep: () => void;
    /**
     * Updates the active step to the previous one on the step list. Does nothing when active step has no previous step.
     */
    previousStep: () => void;
    /**
     * Updates the active step.
     */
    updateActiveStep: (stepId: string) => void;
}
