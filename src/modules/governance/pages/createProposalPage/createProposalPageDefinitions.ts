import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum CreateProposalWizardStep {
    METADATA = 'METADATA',
    ACTIONS = 'ACTIONS',
    SETTINGS = 'SETTINGS',
}

export const createProposalWizardSteps: IWizardStepperStep[] = [
    {
        id: CreateProposalWizardStep.METADATA,
        order: 0,
        meta: { name: `app.governance.createProposalPage.steps.${CreateProposalWizardStep.METADATA}.name` },
    },
    {
        id: CreateProposalWizardStep.ACTIONS,
        order: 1,
        meta: { name: `app.governance.createProposalPage.steps.${CreateProposalWizardStep.ACTIONS}.name` },
    },
    {
        id: CreateProposalWizardStep.SETTINGS,
        order: 2,
        meta: { name: `app.governance.createProposalPage.steps.${CreateProposalWizardStep.SETTINGS}.name` },
    },
];
