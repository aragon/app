import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum CreatePolicyWizardStep {
    CONFIGURE = 'CONFIGURE',
    INTERVAL = 'INTERVAL',
    METADATA = 'METADATA',
}

export const createPolicyWizardSteps: IWizardStepperStep[] = [
    {
        id: CreatePolicyWizardStep.METADATA,
        order: 0,
        meta: {
            name: `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.METADATA}.name`,
        },
    },
    {
        id: CreatePolicyWizardStep.CONFIGURE,
        order: 1,
        meta: {
            name: `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.CONFIGURE}.name`,
        },
    },
    {
        id: CreatePolicyWizardStep.INTERVAL,
        order: 2,
        meta: {
            name: `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.INTERVAL}.name`,
        },
    },
];
