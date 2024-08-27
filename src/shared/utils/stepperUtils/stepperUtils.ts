export interface IStepperStep<TMeta = undefined, TStepId = string> {
    /**
     * ID of the step.
     */
    id: TStepId;
    /**
     * Order of the step inside the steps array.
     */
    order: number;
    /**
     * Metadata of the step.
     */
    meta: TMeta;
}

export class StepperUtils<TMeta = undefined, TStepId = string> {
    private steps: Array<IStepperStep<TMeta, TStepId>>;

    private activeStep?: TStepId;

    constructor(steps: Array<IStepperStep<TMeta, TStepId>> = [], activeStep?: TStepId) {
        this.steps = StepperUtils.sortSteps(steps);
        this.activeStep = activeStep ?? this.steps[0]?.id;
    }

    static sortSteps = <TMeta = undefined, TStepId = string>(
        steps: Array<IStepperStep<TMeta, TStepId>>,
    ): Array<IStepperStep<TMeta, TStepId>> => [...steps].sort((stepA, stepB) => stepA.order - stepB.order);

    getActiveStep = () => this.activeStep;

    setActiveStep = (stepId: TStepId) => {
        this.activeStep = stepId;

        return this.activeStep;
    };

    getSteps = () => this.steps;

    setSteps = (steps: Array<IStepperStep<TMeta, TStepId>>) => {
        this.steps = steps;

        return this.steps;
    };

    findStepIndex = (stepId?: TStepId) => this.steps.findIndex((step) => step.id === stepId);

    hasPrevious = () => this.findStepIndex(this.activeStep) > 0;

    hasNext = () => this.findStepIndex(this.activeStep) < this.steps.length - 1;

    addStep = (step: IStepperStep<TMeta, TStepId>) => {
        if (this.findStepIndex(step.id) >= 0) {
            return this.steps;
        }

        const newSteps = [...this.steps];
        newSteps.splice(step.order, 0, step);
        this.steps = newSteps;

        return this.steps;
    };

    removeStep = (stepId: TStepId) => {
        this.steps = this.findStepIndex(stepId) < 0 ? this.steps : this.steps.filter((step) => step.id !== stepId);

        return this.steps;
    };

    next = () => {
        const activeStepIndex = this.findStepIndex(this.activeStep);
        this.activeStep = this.hasNext() ? this.steps[activeStepIndex + 1].id : this.activeStep;

        return this.activeStep;
    };

    previous = () => {
        const activeStepIndex = this.findStepIndex(this.activeStep);
        this.activeStep = this.hasPrevious() ? this.steps[activeStepIndex - 1].id : this.activeStep;

        return this.activeStep;
    };
}

export const stepperUtils = new StepperUtils();
