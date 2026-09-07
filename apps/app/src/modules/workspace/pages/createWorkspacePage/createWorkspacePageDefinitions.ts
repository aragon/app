import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum CreateWorkspaceWizardStep {
    METADATA = 'METADATA',
    TARGETS = 'TARGETS',
    ACCOUNTS = 'ACCOUNTS',
}

/**
 * Steps of the create-workspace wizard. Targets are entered before accounts so that accounts discovered from the
 * targets can be offered on the accounts step later on.
 */
export const createWorkspaceWizardSteps: IWizardStepperStep[] = [
    {
        id: CreateWorkspaceWizardStep.METADATA,
        order: 0,
        meta: {
            name: `app.workspace.createWorkspacePage.steps.${CreateWorkspaceWizardStep.METADATA}.name`,
        },
    },
    {
        id: CreateWorkspaceWizardStep.TARGETS,
        order: 1,
        meta: {
            name: `app.workspace.createWorkspacePage.steps.${CreateWorkspaceWizardStep.TARGETS}.name`,
        },
    },
    {
        id: CreateWorkspaceWizardStep.ACCOUNTS,
        order: 2,
        meta: {
            name: `app.workspace.createWorkspacePage.steps.${CreateWorkspaceWizardStep.ACCOUNTS}.name`,
        },
    },
];
