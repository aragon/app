import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';
import { WorkspaceWizardStep } from '../../constants/workspaceWizardStep';

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
 * Builds the steps of a workspace wizard, in the order the enum declares them.
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
