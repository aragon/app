import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum SafeCreateTransactionWizardStep {
    ACTIONS = 'ACTIONS',
}

export const safeCreateTransactionWizardSteps: IWizardStepperStep[] = [
    {
        id: SafeCreateTransactionWizardStep.ACTIONS,
        order: 0,
        meta: {
            name: `app.safe.safeCreateTransactionWizard.steps.${SafeCreateTransactionWizardStep.ACTIONS}.name`,
        },
    },
];

export const safeCreateTransactionWizardId = 'safeCreateTransactionWizard';
