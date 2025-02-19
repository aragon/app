import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { createContext, useContext } from 'react';

export interface IWizardContainerStepMeta {
    /**
     * Name of the step.
     */
    name: string;
}

export interface IWizardStepperStep extends IStepperStep<IWizardContainerStepMeta> {}

export interface IWizardContext extends IUseStepperReturn<IWizardContainerStepMeta> {
    /**
     * Label of the submit button at the end of the wizard.
     */
    submitLabel: string;
}

const wizardContext = createContext<IWizardContext | null>(null);

export const WizardProvider = wizardContext.Provider;

export const useWizardContext = () => {
    const values = useContext(wizardContext);

    if (values == null) {
        throw new Error('useWizardContext: hook must be used inside a WizardProvider to work properly');
    }

    return values;
};
