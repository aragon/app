import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum WorkspaceEditWizardStep {
    METADATA = 'METADATA',
    TARGETS = 'TARGETS',
    ACCOUNTS = 'ACCOUNTS',
}

/**
 * Steps of the edit-workspace wizard, mirroring the ones of the create-workspace wizard.
 */
export const workspaceEditWizardSteps: IWizardStepperStep[] = [
    {
        id: WorkspaceEditWizardStep.METADATA,
        order: 0,
        meta: {
            name: `app.workspace.workspaceEditPage.steps.${WorkspaceEditWizardStep.METADATA}.name`,
        },
    },
    {
        id: WorkspaceEditWizardStep.TARGETS,
        order: 1,
        meta: {
            name: `app.workspace.workspaceEditPage.steps.${WorkspaceEditWizardStep.TARGETS}.name`,
        },
    },
    {
        id: WorkspaceEditWizardStep.ACCOUNTS,
        order: 2,
        meta: {
            name: `app.workspace.workspaceEditPage.steps.${WorkspaceEditWizardStep.ACCOUNTS}.name`,
        },
    },
];
