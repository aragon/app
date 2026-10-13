import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum WorkspaceWizardStep {
    METADATA = 'METADATA',
    TARGETS = 'TARGETS',
    ACCOUNTS = 'ACCOUNTS',
}

/**
 * Step of a workspace wizard, its ID narrowed to the steps the wizard knows.
 */
export interface IWorkspaceWizardStepperStep extends IWizardStepperStep {
    /**
     * ID of the step.
     */
    id: WorkspaceWizardStep;
}

/**
 * Builds the steps of a workspace wizard, in the order the enum declares them. Targets are entered before accounts
 * so that accounts discovered from the targets can be offered on the accounts step later on.
 * @param translationNamespace - Namespace of the wizard translations, e.g. `app.workspace.createWorkspacePage`.
 * @returns The steps, their `meta.name` being the untranslated key of the step name.
 */
export const buildWorkspaceWizardSteps = (
    translationNamespace: string,
): IWorkspaceWizardStepperStep[] =>
    Object.values(WorkspaceWizardStep).map((id, order) => ({
        id,
        order,
        meta: { name: `${translationNamespace}.steps.${id}.name` },
    }));
