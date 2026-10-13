'use client';

import { useMemo } from 'react';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import { useWorkspace } from '../../api/workspaceService';
import {
    CreateWorkspaceForm,
    type ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IPublishWorkspaceDialogParams } from '../../dialogs/publishWorkspaceDialog';
import {
    WorkspaceEditWizardStep,
    workspaceEditWizardSteps,
} from './workspaceEditPageDefinitions';
import { workspaceEditPageUtils } from './workspaceEditPageUtils';

export interface IWorkspaceEditPageClientProps {
    /**
     * ID of the workspace to edit.
     */
    workspaceId: string;
}

/**
 * Edit-workspace wizard, filled in from the stored workspace. It owns no loading or error state: `WorkspaceGate`
 * renders the page only once the workspace has resolved, so the query below is served from the cache the gate has
 * already filled and the form default values, read on mount, are always those of the workspace.
 */
export const WorkspaceEditPageClient: React.FC<
    IWorkspaceEditPageClientProps
> = (props) => {
    const { workspaceId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const processedSteps = useMemo(
        () =>
            workspaceEditWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    // Narrows the type only; the gate above has already resolved the workspace.
    if (workspace == null) {
        return null;
    }

    const handleFormSubmit = (values: ICreateWorkspaceFormData) => {
        plausibleAnalyticsUtils.track('wizard_submit', {
            flow: 'edit_workspace',
            accounts: values.accounts.length,
            targets: values.targets.length,
            hasAvatar: values.avatar != null,
        });
        const params: IPublishWorkspaceDialogParams = { values, workspaceId };
        open(WorkspaceDialogId.PUBLISH_WORKSPACE, { params });
    };

    const [metadataStep, targetsStep, accountsStep] = workspaceEditWizardSteps;

    return (
        <Page.Main fullWidth={true}>
            <WizardPage.Container
                analytics={{ flow: 'edit_workspace' }}
                defaultValues={workspaceEditPageUtils.buildFormValues(
                    workspace,
                )}
                finalStep={t('app.workspace.workspaceEditPage.finalStep')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                submitLabel={t('app.workspace.workspaceEditPage.submitLabel')}
            >
                <WizardPage.Step
                    description={t(
                        `app.workspace.workspaceEditPage.steps.${WorkspaceEditWizardStep.METADATA}.description`,
                    )}
                    title={t(
                        `app.workspace.workspaceEditPage.steps.${WorkspaceEditWizardStep.METADATA}.title`,
                    )}
                    {...metadataStep}
                >
                    <CreateWorkspaceForm.Metadata />
                </WizardPage.Step>
                <WizardPage.Step
                    description={t(
                        `app.workspace.workspaceEditPage.steps.${WorkspaceEditWizardStep.TARGETS}.description`,
                    )}
                    title={t(
                        `app.workspace.workspaceEditPage.steps.${WorkspaceEditWizardStep.TARGETS}.title`,
                    )}
                    {...targetsStep}
                >
                    <CreateWorkspaceForm.Targets />
                </WizardPage.Step>
                <WizardPage.Step
                    description={t(
                        `app.workspace.workspaceEditPage.steps.${WorkspaceEditWizardStep.ACCOUNTS}.description`,
                    )}
                    title={t(
                        `app.workspace.workspaceEditPage.steps.${WorkspaceEditWizardStep.ACCOUNTS}.title`,
                    )}
                    {...accountsStep}
                >
                    <CreateWorkspaceForm.Accounts />
                </WizardPage.Step>
            </WizardPage.Container>
        </Page.Main>
    );
};
