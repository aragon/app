import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';

export enum CreateProcessWizardStep {
    METADATA = 'METADATA',
    STAGES = 'STAGES',
}

export const createProcessWizardSteps: IWizardStepperStep[] = [
    {
        id: CreateProcessWizardStep.METADATA,
        order: 0,
        meta: { name: `app.governance.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.name` },
    },
    {
        id: CreateProcessWizardStep.STAGES,
        order: 1,
        meta: { name: 'Setup Process' },
    },
];
