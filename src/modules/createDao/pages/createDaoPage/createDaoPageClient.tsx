'use client';

import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useMemo } from 'react';
import { CreateDaoForm, type ICreateDaoFormData } from '../../components/createDaoForm';
import { CreateDaoDialogId } from '../../constants/createDaoDialogId';
import type { IPublishDaoDialogParams } from '../../dialogs/publishDaoDialog';
import { CreateDaoWizardStep, createDaoWizardSteps } from './createDaoPageDefinitions';

export interface ICreateDaoPageClientProps {}

export const CreateDaoPageClient: React.FC<ICreateDaoPageClientProps> = () => {
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { check: checkWalletConnection } = useConnectedWalletGuard();

    const handleFormSubmit = (values: ICreateDaoFormData) => {
        const params: IPublishDaoDialogParams = { values };
        checkWalletConnection({
            onSuccess: () => open(CreateDaoDialogId.PUBLISH_DAO, { params }),
        });
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
            <WizardPage.Container
                finalStep={t('app.createDao.createDaoPage.finalStep')}
                submitLabel={t('app.createDao.createDaoPage.submitLabel')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
            >
                <WizardPage.Step
                    title={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.NETWORK}.title`)}
                    description={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.NETWORK}.description`)}
                    {...networkStep}
                >
                    <CreateDaoForm.Network />
                </WizardPage.Step>
                <WizardPage.Step
                    title={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.METADATA}.title`)}
                    description={t(`app.createDao.createDaoPage.steps.${CreateDaoWizardStep.METADATA}.description`)}
                    {...metadataStep}
                >
                    <CreateDaoForm.Metadata />
                </WizardPage.Step>
            </WizardPage.Container>
        </Page.Main>
    );
};
