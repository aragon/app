import { StepperUtils } from './stepperUtils';

describe('stepper utils', () => {
    describe('constructor', () => {
        it('initializes the class attributes using the properties specified', () => {
            const steps = [
                { id: '0', order: 0, meta: null },
                { id: '1', order: 1, meta: null },
            ];
            const activeStep = '0';
            const instance = new StepperUtils(steps, activeStep);
            expect(instance['steps']).toEqual(steps);
            expect(instance['activeStep']).toEqual(activeStep);
        });

        it('sorts the steps using the order attribute', () => {
            const steps = [
                { id: '1', order: 1, meta: null },
                { id: '0', order: 0, meta: null },
            ];
            const instance = new StepperUtils(steps);
            expect(instance['steps']).toEqual([
                { id: '0', order: 0, meta: null },
                { id: '1', order: 1, meta: null },
            ]);
        });

        it('defaults the active step to the first element of the sorted steps', () => {
            const steps = [
                { id: '3', order: 3, meta: null },
                { id: '1', order: 1, meta: null },
                { id: '0', order: 0, meta: null },
            ];
            const instance = new StepperUtils(steps);
            expect(instance['activeStep']).toEqual('0');
        });
    });

    describe('sortSteps', () => {
        it('returns a new array sorted based on othe order property', () => {
            const steps = [
                { id: '5', order: 5, meta: null },
                { id: '0', order: 0, meta: null },
                { id: '2', order: 2, meta: null },
            ];
            expect(StepperUtils.sortSteps(steps)).toEqual([
                { id: '0', order: 0, meta: null },
                { id: '2', order: 2, meta: null },
                { id: '5', order: 5, meta: null },
            ]);
            expect(steps[0].id).toEqual('5');
        });
    });

    describe('activeStep getter/setter', () => {
        it('getActiveStep returns the active step', () => {
            const activeStep = 'step';
            expect(new StepperUtils(undefined, activeStep).getActiveStep()).toEqual(activeStep);
        });

        it('setActiveStep updates the current active step and returns it', () => {
            const activeStep = '001';
            const newActiveStep = '002';
            const instance = new StepperUtils(undefined, activeStep);
            expect(instance.setActiveStep(newActiveStep)).toEqual(newActiveStep);
            expect(instance['activeStep']).toEqual(newActiveStep);
        });
    });

    describe('steps getter/setter', () => {
        it('getSteps returns the steps array', () => {
            const steps = [
                { id: '1', order: 1, meta: null },
                { id: '2', order: 2, meta: null },
            ];
            expect(new StepperUtils(steps).getSteps()).toEqual(steps);
        });

        it('setSteps updates and returns the steps array', () => {
            const steps = [{ id: '0', order: 0, meta: null }];
            const newSteps = [{ id: '1', order: 1, meta: null }];
            const instance = new StepperUtils(steps);
            expect(instance.setSteps(newSteps)).toEqual(newSteps);
            expect(instance['steps']).toEqual(newSteps);
        });
    });

    describe('findStepIndex', () => {
        it('returns the index of the step with the specified id', () => {
            const steps = [
                { id: '1', order: 1, meta: null },
                { id: '3', order: 3, meta: null },
            ];
            const instance = new StepperUtils(steps);
            expect(instance.findStepIndex(steps[1].id)).toEqual(1);
            expect(instance.findStepIndex(steps[0].id)).toEqual(0);
        });

        it('returns -1 when step is not found', () => {
            const steps = [
                { id: 'abc', order: 0, meta: null },
                { id: 'def', order: 1, meta: null },
            ];
            expect(new StepperUtils(steps).findStepIndex('ghi')).toEqual(-1);
        });
    });

    describe('hasPrevious', () => {
        it('returns true if current active step has a previous step', () => {
            const steps = [
                { id: '1', order: 1, meta: null },
                { id: '2', order: 2, meta: null },
            ];
            const activeStep = steps[1].id;
            expect(new StepperUtils(steps, activeStep).hasPrevious()).toBeTruthy();
        });

        it('returns false if current active step does not have a previous step', () => {
            const steps = [{ id: '1', order: 1, meta: null }];
            const activeStep = steps[0].id;
            expect(new StepperUtils(steps, activeStep).hasPrevious()).toBeFalsy();
        });
    });

    describe('hasNext', () => {
        it('returns true if current active step has a next step', () => {
            const steps = [
                { id: '1', order: 1, meta: null },
                { id: '2', order: 2, meta: null },
                { id: '3', order: 3, meta: null },
            ];
            const activeStep = steps[1].id;
            expect(new StepperUtils(steps, activeStep).hasNext()).toBeTruthy();
        });

        it('returns false if current active step does not have a next step', () => {
            const steps = [
                { id: '1', order: 1, meta: null },
                { id: '2', order: 2, meta: null },
            ];
            const activeStep = steps[1].id;
            expect(new StepperUtils(steps, activeStep).hasNext()).toBeFalsy();
        });
    });

    describe('addStep', () => {
        it('adds the new step at the order specified and returns the updated steps array', () => {
            const steps = [
                { id: '0', order: 0, meta: null },
                { id: '2', order: 2, meta: null },
            ];
            const addStep = { id: '1', order: 1, meta: null };
            const newSteps = [steps[0], addStep, steps[1]];
            const instance = new StepperUtils(steps);
            expect(instance.addStep(addStep)).toEqual(newSteps);
            expect(instance.getSteps()).toEqual(newSteps);
        });

        it('only returns the current steps array when step already exists', () => {
            const steps = [
                { id: '0', order: 0, meta: null },
                { id: '1', order: 1, meta: null },
            ];
            const addStep = { id: '1', order: 1, meta: null };
            const instance = new StepperUtils(steps);
            expect(instance.addStep(addStep)).toEqual(steps);
            expect(instance.getSteps()).toEqual(steps);
        });
    });

    describe('removeStep', () => {
        it('removes the step with the specified id and returns the updated steps array', () => {
            const steps = [
                { id: '001', order: 0, meta: null },
                { id: '005', order: 1, meta: null },
                { id: '008', order: 2, meta: null },
            ];
            const newSteps = [steps[0], steps[2]];
            const instance = new StepperUtils(steps);
            expect(instance.removeStep(steps[1].id)).toEqual(newSteps);
            expect(instance.getSteps()).toEqual(newSteps);
        });

        it('only returns the current steps array when step with specified id does not exist', () => {
            const steps = [
                { id: '000', order: 0, meta: null },
                { id: '002', order: 1, meta: null },
            ];
            const instance = new StepperUtils(steps);
            expect(instance.removeStep('001')).toEqual(steps);
            expect(instance.getSteps()).toEqual(steps);
        });
    });

    describe('next', () => {
        it('updates the active step to the next in list and returns it', () => {
            const steps = [
                { id: '000', order: 0, meta: null },
                { id: '001', order: 1, meta: null },
                { id: '002', order: 2, meta: null },
            ];
            const activeStep = steps[1].id;
            const instance = new StepperUtils(steps, activeStep);
            expect(instance.next()).toEqual(steps[2].id);
            expect(instance.getActiveStep()).toEqual(steps[2].id);
        });

        it('returns the current active step and does not update it when active step has no next step', () => {
            const steps = [
                { id: '000', order: 0, meta: null },
                { id: '002', order: 1, meta: null },
            ];
            const activeStep = steps[1].id;
            const instance = new StepperUtils(steps, activeStep);
            expect(instance.next()).toEqual(activeStep);
            expect(instance.getActiveStep()).toEqual(activeStep);
        });
    });

    describe('previous', () => {
        it('updates the active step to the previous in list and returns it', () => {
            const steps = [
                { id: '000', order: 0, meta: null },
                { id: '001', order: 1, meta: null },
                { id: '002', order: 2, meta: null },
            ];
            const activeStep = steps[2].id;
            const instance = new StepperUtils(steps, activeStep);
            expect(instance.previous()).toEqual(steps[1].id);
            expect(instance.getActiveStep()).toEqual(steps[1].id);
        });

        it('returns the current active step and does not update it when active step has no next step', () => {
            const steps = [
                { id: '000', order: 0, meta: null },
                { id: '002', order: 1, meta: null },
            ];
            const activeStep = steps[0].id;
            const instance = new StepperUtils(steps, activeStep);
            expect(instance.previous()).toEqual(activeStep);
            expect(instance.getActiveStep()).toEqual(activeStep);
        });
    });
});
