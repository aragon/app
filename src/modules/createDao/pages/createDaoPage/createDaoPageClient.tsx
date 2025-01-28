'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import { useMemo } from 'react';
import { CreateDaoForm, type ICreateDaoFormData } from '../../components/createDaoForm';
import { CreateDaoDialog } from '../../constants/moduleDialogs';
import type { IPublishDaoDialogParams } from '../../dialogs/publishDaoDialog';
import { CreateDaoWizardStep, createDaoWizardSteps } from './createDaoPageDefinitions';

export interface ICreateDaoPageClientProps {}

export const CreateDaoPageClient: React.FC<ICreateDaoPageClientProps> = () => {
    const { open } = useDialogContext();
    const { t } = useTranslations();

    const handleFormSubmit = (values: ICreateDaoFormData) => {
        const params: IPublishDaoDialogParams = { values };
        open(CreateDaoDialog.PUBLISH_DAO, { params });
    };

    const [networkStep, metadataStep] = createDaoWizardSteps;

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
            <Wizard.Root submitLabel={t('app.createDao.createDaoPage.submitLabel')} initialSteps={processedSteps}>
                <Wizard.Form finalStep={t('app.createDao.createDaoPage.finalStep')} onSubmit={handleFormSubmit}>
                    <Wizard.StepPage
                        title={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.NETWORK}.title`)}
                        description={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.NETWORK}.description`)}
                        {...networkStep}
                    >
                        <CreateDaoForm.Network />
                    </Wizard.StepPage>
                    <Wizard.StepPage
                        title={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.METADATA}.title`)}
                        description={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.METADATA}.description`)}
                        {...metadataStep}
                    >
                        <CreateDaoForm.Metadata />
                    </Wizard.StepPage>
                </Wizard.Form>
            </Wizard.Root>
        </Page.Main>
    );
};
