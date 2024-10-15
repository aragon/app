'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import { useMemo } from 'react';
import { CreateDaoForm, ICreateDaoFormData } from '../../components/createDaoForm';
import { CreateDaoWizardStep, createDaoWizardSteps } from './createDaoPageDefinitions';

export interface ICreateDaoPageClientProps {}

export const CreateDaoPageClient: React.FC<ICreateDaoPageClientProps> = () => {
    const { t } = useTranslations();

    const handleFormSubmit = (values: ICreateDaoFormData) => {
        console.log({ values });
        // const params: IPublishProposalDialogParams = { values, daoId, pluginAddress, prepareActions };
        // open(GovernanceDialogs.PUBLISH_PROPOSAL, { params });
    };

    const [debugStep, metadataStep] = createDaoWizardSteps;

    const processedSteps = useMemo(
        () =>
            createDaoWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <Wizard.Container
                finalStep={t('app.createDao.createDaoPage.finalStep')}
                submitLabel={t('app.createDao.createDaoPage.submitLabel')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
            >
                <Wizard.Step
                    title={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.DEBUG}.title`)}
                    description={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.DEBUG}.description`)}
                    {...debugStep}
                >
                    <CreateDaoForm.Debug />
                </Wizard.Step>
                <Wizard.Step
                    title={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.METADATA}.title`)}
                    description={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.METADATA}.description`)}
                    {...metadataStep}
                >
                    <CreateDaoForm.Metadata />
                </Wizard.Step>
            </Wizard.Container>
        </Page.Main>
    );
};
