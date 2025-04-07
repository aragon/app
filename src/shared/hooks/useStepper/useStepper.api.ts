import type { IStepperStep } from '@/shared/utils/stepperUtils';

export interface IStepperPhase {
    /**
     * Title of the stepper based on the active dialog phase.
     */
    title?: string;
    /**
     * Current number of the stepper based on the active dialog phase.
     */
    index?: number;
    /**
     * Total number of phases in the dialog flow.
     */
    length?: number;
}

export interface IUseStepperParams<TMeta = undefined, TStepId extends string = string> {
    /**
     * Initial steps used to populate the steps array.
     */
    initialSteps?: Array<IStepperStep<TMeta, TStepId>>;
    /**
     * Initial active step, defaults to the first element on the initialSteps array.
     */
    initialActiveStep?: TStepId;
    /**
     * Information about the stepper based on the active dialog phase.
     */
    phase?: IStepperPhase;
}

export interface IUseStepperReturn<TMeta = undefined, TStepId extends string = string> {
    /**
     * Information about the stepper based on the active dialog phase.
     */
    phase?: IStepperPhase;
    /**
     * Array of steps ordered by order value.
     */
    steps: Array<IStepperStep<TMeta, TStepId>>;
    /**
     * Current active step id.
     */
    activeStep?: TStepId;
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
    registerStep: (step: IStepperStep<TMeta, TStepId>) => void;
    /**
     * Unregisters the step with the specified id.
     */
    unregisterStep: (stepId: TStepId) => void;
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
    updateActiveStep: (stepId: TStepId) => void;
    /**
     * Updates all stepper steps.
     */
    updateSteps: (steps: Array<IStepperStep<TMeta, TStepId>>) => void;
}
