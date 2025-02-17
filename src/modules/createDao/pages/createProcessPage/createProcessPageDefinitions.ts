import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum CreateProcessWizardStep {
    METADATA = 'METADATA',
    STAGES = 'STAGES',
    PERMISSIONS = 'PERMISSIONS',
}

export const createProcessWizardSteps: IWizardStepperStep[] = [
    {
        id: CreateProcessWizardStep.METADATA,
        order: 0,
        meta: { name: `app.createDao.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.name` },
    },
    {
        id: CreateProcessWizardStep.STAGES,
        order: 1,
        meta: { name: `app.createDao.createProcessPage.steps.${CreateProcessWizardStep.STAGES}.name` },
    },
    {
        id: CreateProcessWizardStep.PERMISSIONS,
        order: 2,
        meta: { name: `app.createDao.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.name` },
    },
];
