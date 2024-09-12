import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';

export enum CreateProcessWizardStep {
    METADATA = 'METADATA',
    PROCESSES = 'PROCESSES',
    PERMISSIONS = 'PERMISSIONS',
}

export const createProcessWizardSteps: IWizardStepperStep[] = [
    {
        id: CreateProcessWizardStep.METADATA,
        order: 0,
        meta: { name: `app.governance.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.name` },
    },
    {
        id: CreateProcessWizardStep.PROCESSES,
        order: 1,
        meta: { name: `app.governance.createProcessPage.steps.${CreateProcessWizardStep.PROCESSES}.name` },
    },
    {
        id: CreateProcessWizardStep.PERMISSIONS,
        order: 2,
        meta: { name: `app.governance.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.name` },
    },
];
