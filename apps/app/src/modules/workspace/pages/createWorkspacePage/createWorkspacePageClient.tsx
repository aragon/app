'use client';

import { useMemo } from 'react';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import {
    CreateWorkspaceForm,
    createWorkspaceFormDefaultValues,
    type ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IPublishWorkspaceDialogParams } from '../../dialogs/publishWorkspaceDialog';
import {
    CreateWorkspaceWizardStep,
    createWorkspaceWizardSteps,
} from './createWorkspacePageDefinitions';

export interface ICreateWorkspacePageClientProps {}

export const CreateWorkspacePageClient: React.FC<
    ICreateWorkspacePageClientProps
> = () => {
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { check: checkWalletConnection } = useConnectedWalletGuard();

    const handleFormSubmit = (values: ICreateWorkspaceFormData) => {
        const params: IPublishWorkspaceDialogParams = { values };
        checkWalletConnection({
            onSuccess: () => {
                plausibleAnalyticsUtils.track('wizard_submit', {
                    flow: 'create_workspace',
                    accounts: values.accounts.length,
                    targets: values.targets.length,
                    hasAvatar: values.avatar != null,
                });
                open(WorkspaceDialogId.PUBLISH_WORKSPACE, { params });
            },
        });
    };

    const [metadataStep, targetsStep, accountsStep] =
        createWorkspaceWizardSteps;

    const processedSteps = useMemo(
        () =>
            createWorkspaceWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <WizardPage.Container
                analytics={{ flow: 'create_workspace' }}
                defaultValues={createWorkspaceFormDefaultValues}
                finalStep={t('app.workspace.createWorkspacePage.finalStep')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                submitLabel={t('app.workspace.createWorkspacePage.submitLabel')}
            >
                <WizardPage.Step
                    description={t(
                        `app.workspace.createWorkspacePage.steps.${CreateWorkspaceWizardStep.METADATA}.description`,
                    )}
                    title={t(
                        `app.workspace.createWorkspacePage.steps.${CreateWorkspaceWizardStep.METADATA}.title`,
                    )}
                    {...metadataStep}
                >
                    <CreateWorkspaceForm.Metadata />
                </WizardPage.Step>
                <WizardPage.Step
                    description={t(
                        `app.workspace.createWorkspacePage.steps.${CreateWorkspaceWizardStep.TARGETS}.description`,
                    )}
                    title={t(
                        `app.workspace.createWorkspacePage.steps.${CreateWorkspaceWizardStep.TARGETS}.title`,
                    )}
                    {...targetsStep}
                >
                    <CreateWorkspaceForm.Targets />
                </WizardPage.Step>
                <WizardPage.Step
                    description={t(
                        `app.workspace.createWorkspacePage.steps.${CreateWorkspaceWizardStep.ACCOUNTS}.description`,
                    )}
                    title={t(
                        `app.workspace.createWorkspacePage.steps.${CreateWorkspaceWizardStep.ACCOUNTS}.title`,
                    )}
                    {...accountsStep}
                >
                    <CreateWorkspaceForm.Accounts />
                </WizardPage.Step>
            </WizardPage.Container>
        </Page.Main>
    );
};
