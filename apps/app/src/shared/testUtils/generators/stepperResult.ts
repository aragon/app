import type { IUseStepperReturn } from '@/shared/hooks/useStepper';

export const generateStepperResult = <TMeta, TStepId extends string>(
    values?: Partial<IUseStepperReturn<TMeta, TStepId>>,
): IUseStepperReturn<TMeta, TStepId> => ({
    steps: [],
    activeStepIndex: -1,
    hasNext: false,
    hasPrevious: false,
    registerStep: jest.fn(),
    unregisterStep: jest.fn(),
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    updateActiveStep: jest.fn(),
    updateSteps: jest.fn(),
    ...values,
});
