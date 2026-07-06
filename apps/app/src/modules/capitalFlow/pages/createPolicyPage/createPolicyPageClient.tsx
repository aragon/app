'use client';

import { useMemo } from 'react';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useProposalPermissionCheckGuard } from '../../../governance/hooks/useProposalPermissionCheckGuard';
import {
    CreatePolicyForm,
    type ICreatePolicyFormData,
} from '../../components/createPolicyForm';
import { CapitalFlowDialogId } from '../../constants/capitalFlowDialogId';
import type { IPreparePolicyDialogParams } from '../../dialogs/preparePolicyDialog';
import {
    CreatePolicyWizardStep,
    createPolicyWizardSteps,
} from './createPolicyPageDefinitions';

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

export const CreatePolicyPageClient: React.FC<ICreatePolicyPageClientProps> = (
    props,
) => {
    const { daoId, pluginAddress } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    useProposalPermissionCheckGuard({
        daoId,
        pluginAddress,
        redirectTab: 'settings',
    });

    const handleFormSubmit = (values: ICreatePolicyFormData) => {
        const dialogParams: IPreparePolicyDialogParams = {
            daoId,
            values,
            pluginAddress,
        };
        open(CapitalFlowDialogId.PREPARE_POLICY, { params: dialogParams });
    };

    const processedSteps = useMemo(
        () =>
            createPolicyWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    const [metadataStep, configureStep, intervalStep] = processedSteps;

    return (
        <Page.Main fullWidth={true}>
            <WizardPage.Container
                finalStep={t('app.capitalFlow.createPolicyPage.finalStep')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                submitLabel={t('app.capitalFlow.createPolicyPage.submitLabel')}
            >
                <WizardPage.Step
                    description={t(
                        `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.METADATA}.description`,
                    )}
                    title={t(
                        `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.METADATA}.title`,
                    )}
                    {...metadataStep}
                >
                    <CreatePolicyForm.Metadata />
                </WizardPage.Step>
                <WizardPage.Step
                    description={t(
                        `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.CONFIGURE}.description`,
                    )}
                    title={t(
                        `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.CONFIGURE}.title`,
                    )}
                    {...configureStep}
                >
                    <CreatePolicyForm.Configure daoId={daoId} />
                </WizardPage.Step>
                <WizardPage.Step
                    description={t(
                        `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.INTERVAL}.description`,
                    )}
                    title={t(
                        `app.capitalFlow.createPolicyPage.steps.${CreatePolicyWizardStep.INTERVAL}.title`,
                    )}
                    {...intervalStep}
                >
                    <CreatePolicyForm.Interval />
                </WizardPage.Step>
            </WizardPage.Container>
        </Page.Main>
    );
};
