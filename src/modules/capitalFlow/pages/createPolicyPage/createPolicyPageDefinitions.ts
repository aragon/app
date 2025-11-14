import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum CreatePolicyWizardStep {
    NETWORK = 'NETWORK',
    METADATA = 'METADATA',
}

export const createPolicyWizardSteps: IWizardStepperStep[] = [
    {
        id: CreatePolicyWizardStep.NETWORK,
        order: 0,
        meta: { name: `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.NETWORK}.name` },
    },
    {
        id: CreatePolicyWizardStep.METADATA,
        order: 1,
        meta: { name: `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.METADATA}.name` },
    },
];
