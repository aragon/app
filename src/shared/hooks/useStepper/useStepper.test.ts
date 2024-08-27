import { act, renderHook } from '@testing-library/react';
import { useStepper } from './useStepper';

describe('useStepper hook', () => {
    it('returns the initial steps ordered and initialises the active step', () => {
        const initialSteps = [
            { id: '001', order: 1, meta: null },
            { id: '000', order: 0, meta: null },
        ];
        const { result } = renderHook(() => useStepper({ initialSteps }));
        expect(result.current.steps).toEqual([initialSteps[1], initialSteps[0]]);
        expect(result.current.activeStep).toEqual(initialSteps[1].id);
        expect(result.current.activeStepIndex).toEqual(0);
    });

    it('registerSteps adds the new step to the steps array', () => {
        const newStep = { id: '001', order: 1, meta: null };
        const { result } = renderHook(() => useStepper());
        act(() => result.current.registerStep(newStep));
        expect(result.current.steps).toEqual([newStep]);
    });

    it('unregisterSteps removes the specified step from the steps array', () => {
        const initialSteps = [
            { id: '001', order: 1, meta: null },
            { id: '000', order: 0, meta: null },
            { id: '005', order: 2, meta: null },
        ];
        const { result } = renderHook(() => useStepper({ initialSteps }));
        act(() => result.current.unregisterStep('000'));
        expect(result.current.steps).toEqual([initialSteps[0], initialSteps[2]]);
    });

    it('nextSteps update the active step to the next on the array', () => {
        const initialSteps = [
            { id: '000', order: 0, meta: null },
            { id: '001', order: 1, meta: null },
        ];
        const { result } = renderHook(() => useStepper({ initialSteps }));
        expect(result.current.activeStep).toEqual(initialSteps[0].id);
        act(() => result.current.nextStep());
        expect(result.current.activeStep).toEqual(initialSteps[1].id);
    });

    it('previousStep update the active step to the previous one on the array', () => {
        const initialSteps = [
            { id: '000', order: 0, meta: null },
            { id: '001', order: 1, meta: null },
        ];
        const initialActiveStep = '001';
        const { result } = renderHook(() => useStepper({ initialSteps, initialActiveStep }));
        expect(result.current.activeStep).toEqual(initialSteps[1].id);
        act(() => result.current.previousStep());
        expect(result.current.activeStep).toEqual(initialSteps[0].id);
    });

    it('updateActiveStep updates the active step', () => {
        const initialSteps = [
            { id: '000', order: 0, meta: null },
            { id: '001', order: 1, meta: null },
            { id: '002', order: 2, meta: null },
        ];
        const initialActiveStep = '002';
        const { result } = renderHook(() => useStepper({ initialSteps, initialActiveStep }));
        expect(result.current.activeStep).toEqual(initialSteps[2].id);
        act(() => result.current.updateActiveStep('000'));
        expect(result.current.activeStep).toEqual(initialSteps[0].id);
    });

    it('updateSteps updates the stepper steps', () => {
        const initialSteps = [{ id: '0', order: 0, meta: null }];
        const newSteps = [{ id: '2', order: 2, meta: null }];
        const { result } = renderHook(() => useStepper({ initialSteps }));
        expect(result.current.steps).toEqual(initialSteps);
        act(() => result.current.updateSteps(newSteps));
        expect(result.current.steps).toEqual(newSteps);
    });

    it('returns properties set to true when current step has a previous and next step', () => {
        const initialSteps = [
            { id: '000', order: 0, meta: null },
            { id: '001', order: 1, meta: null },
            { id: '002', order: 2, meta: null },
        ];
        const initialActiveStep = '001';
        const { result } = renderHook(() => useStepper({ initialSteps, initialActiveStep }));
        expect(result.current.hasNext).toBeTruthy();
        expect(result.current.hasPrevious).toBeTruthy();
    });

    it('returns properties set to false when current step does not have a previous or next step', () => {
        const initialSteps = [{ id: '000', order: 0, meta: null }];
        const { result } = renderHook(() => useStepper({ initialSteps }));
        expect(result.current.hasNext).toBeFalsy();
        expect(result.current.hasPrevious).toBeFalsy();
    });
});
