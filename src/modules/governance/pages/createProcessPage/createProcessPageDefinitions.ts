import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';

export enum CreateProcessWizardStep {
    METADATA = 'METADATA',
    ACTIONS = 'ACTIONS',
    SETTINGS = 'SETTINGS',
}

export const createProcessWizardSteps: IWizardStepperStep[] = [
    {
        id: CreateProcessWizardStep.METADATA,
        order: 0,
        meta: { name: `app.governance.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.name` },
    },
    {
        id: CreateProcessWizardStep.ACTIONS,
        order: 1,
        meta: { name: `app.governance.createProcessPage.steps.${CreateProcessWizardStep.ACTIONS}.name` },
    },
    {
        id: CreateProcessWizardStep.SETTINGS,
        order: 2,
        meta: { name: `app.governance.createProcessPage.steps.${CreateProcessWizardStep.SETTINGS}.name` },
    },
];
