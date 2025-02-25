'use client';

import { useOpenDialogWithConnectedWallet } from '@/modules/application/hooks/useOpenDialogWithConnectedWallet';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useMemo } from 'react';
import { defaultStage, type ICreateProcessFormData } from '../../components/createProcessForm';
import { CreateDaoDialog } from '../../constants/moduleDialogs';
import type { IPrepareProcessDialogParams } from '../../dialogs/prepareProcessDialog';
import { createProcessWizardSteps } from './createProcessPageDefinitions';
import { CreateProcessPageClientSteps } from './createProcessPageSteps';

export interface ICreateProcessPageClientProps {
    /**
     * ID of the current DAO.
     */
    daoId: string;
}

export const CreateProcessPageClient: React.FC<ICreateProcessPageClientProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const openWithConnectedWallet = useOpenDialogWithConnectedWallet();

    const handleFormSubmit = (values: ICreateProcessFormData) => {
        const dialogParams: IPrepareProcessDialogParams = { daoId, values };
        openWithConnectedWallet(CreateDaoDialog.PREPARE_PROCESS, { params: dialogParams });
    };

    const processedSteps = useMemo(
        () => createProcessWizardSteps.map(({ meta, ...step }) => ({ ...step, meta: { ...meta, name: t(meta.name) } })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <WizardPage.Container
                finalStep={t('app.createDao.createProcessPage.finalStep')}
                submitLabel={t('app.createDao.createProcessPage.submitLabel')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                defaultValues={{ stages: [defaultStage] }}
            >
                <CreateProcessPageClientSteps steps={processedSteps} daoId={daoId} />
            </WizardPage.Container>
        </Page.Main>
    );
};
