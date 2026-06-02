import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum CreateExecuteActionsWizardStep {
    ACTIONS = 'ACTIONS',
}

export const createExecuteActionsWizardSteps: IWizardStepperStep[] = [
    {
        id: CreateExecuteActionsWizardStep.ACTIONS,
        order: 0,
        meta: {
            name: `app.governance.createExecuteActionsPage.steps.${CreateExecuteActionsWizardStep.ACTIONS}.name`,
        },
    },
];

export const createExecuteActionsWizardId = 'createExecuteActionsWizard';
