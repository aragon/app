export interface IStepperStep<TMeta = undefined> {
    /**
     * ID of the step.
     */
    id: string;
    /**
     * Order of the step inside the steps array.
     */
    order: number;
    /**
     * Metadata of the step.
     */
    meta: TMeta;
}

export class StepperUtils<TMeta = undefined> {
    private steps: Array<IStepperStep<TMeta>>;

    private activeStep?: string;

    constructor(steps: Array<IStepperStep<TMeta>> = [], activeStep?: string) {
        this.steps = StepperUtils.sortSteps(steps);
        this.activeStep = activeStep ?? this.steps[0]?.id;
    }

    static sortSteps = <TMeta = undefined>(steps: Array<IStepperStep<TMeta>> = []): Array<IStepperStep<TMeta>> =>
        [...steps].sort((stepA, stepB) => stepA.order - stepB.order);

    getActiveStep = () => this.activeStep;

    setActiveStep = (stepId: string) => {
        this.activeStep = stepId;

        return this.activeStep;
    };

    getSteps = () => this.steps;

    findStepIndex = (stepId?: string) => this.steps.findIndex((step) => step.id === stepId);

    hasPrevious = () => this.findStepIndex(this.activeStep) > 0;

    hasNext = () => this.findStepIndex(this.activeStep) < this.steps.length - 1;

    addStep = (step: IStepperStep<TMeta>) => {
        if (this.findStepIndex(step.id) >= 0) {
            return this.steps;
        }

        const newSteps = [...this.steps];
        newSteps.splice(step.order, 0, step);
        this.steps = newSteps;

        return this.steps;
    };

    removeStep = (stepId: string) => {
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
