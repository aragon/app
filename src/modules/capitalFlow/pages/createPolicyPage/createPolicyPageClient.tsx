'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useMemo } from 'react';
import { useProposalPermissionCheckGuard } from '../../../governance/hooks/useProposalPermissionCheckGuard';
import { CreatePolicyForm } from '../../components/createPolicyForm';
import { CreatePolicyWizardStep, createPolicyWizardSteps } from './createPolicyPageDefinitions';

export interface ICreatePolicyPageClientProps {
    /**
     * ID of the current DAO.
     */
    daoId: string;
    /**
     * Plugin address used to create a proposal for adding a new policy.
     */
    pluginAddress: string;
}

export const CreatePolicyPageClient: React.FC<ICreatePolicyPageClientProps> = (props) => {
    const { daoId, pluginAddress } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    useProposalPermissionCheckGuard({ daoId, pluginAddress, redirectTab: 'settings' });

    const handleFormSubmit = () => {};

    // const handleFormSubmit = (values: ICreateProcessFormData) => {
    //     const dialogParams: IPrepareProcessDialogParams = { daoId, values, pluginAddress };
    //     open(CreateDaoDialogId.PREPARE_PROCESS, { params: dialogParams });
    // };

    const processedSteps = useMemo(
        () =>
            createPolicyWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    const [metadataStep, configureStep] = processedSteps;

    return (
        <Page.Main fullWidth={true}>
            <WizardPage.Container
                finalStep={t('app.capitalFlow.createPolicyPage.finalStep')}
                submitLabel={t('app.capitalFlow.createPolicyPage.submitLabel')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
            >
                <WizardPage.Step
                    title={t(`app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.METADATA}.title`)}
                    description={t(
                        `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.METADATA}.description`,
                    )}
                    {...metadataStep}
                >
                    <CreatePolicyForm.Metadata />
                </WizardPage.Step>
                <WizardPage.Step
                    title={t(`app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.CONFIGURE}.title`)}
                    description={t(
                        `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.CONFIGURE}.description`,
                    )}
                    {...configureStep}
                >
                    {/* TODO: Add Network form component */}
                    <div>Network Step Content</div>
                </WizardPage.Step>
            </WizardPage.Container>
        </Page.Main>
    );
};
