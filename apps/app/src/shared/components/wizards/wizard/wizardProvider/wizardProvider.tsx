import { createContext, useContext } from 'react';
import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import type { PlausibleAnalyticsProps } from '@/shared/utils/plausibleAnalyticsUtils';
import type { IStepperStep } from '@/shared/utils/stepperUtils';

export interface IWizardContainerStepMeta {
    /**
     * Name of the step.
     */
    name: string;
}

export interface IWizardStepperStep
    extends IStepperStep<IWizardContainerStepMeta> {}

export interface IWizardAnalytics {
    /**
     * Product flow represented by the wizard.
     */
    flow: string;
    /**
     * Low-cardinality, privacy-safe event properties shared by wizard events.
     */
    props?: PlausibleAnalyticsProps;
}

export interface IWizardContext
    extends IUseStepperReturn<IWizardContainerStepMeta> {
    /**
     * Label of the submit button at the end of the wizard.
     */
    submitLabel: string;
    /**
     * Help text to be displayed under the submit button at the end of the wizard.
     */
    submitHelpText?: string;
    /**
     * Optional analytics metadata for stepper-level product telemetry.
     */
    analytics?: IWizardAnalytics;
}

const wizardContext = createContext<IWizardContext | null>(null);

export const WizardProvider = wizardContext.Provider;

export const useWizardContext = () => {
    const values = useContext(wizardContext);

    if (values == null) {
        throw new Error(
            'useWizardContext: hook must be used inside a WizardProvider to work properly',
        );
    }

    return values;
};
