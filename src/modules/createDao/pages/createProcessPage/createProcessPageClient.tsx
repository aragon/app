'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
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

    const { open } = useDialogContext();

    const handleFormSubmit = (values: ICreateProcessFormData) => {
        const dialogParams: IPrepareProcessDialogParams = { daoId, values };
        open(CreateDaoDialog.PREPARE_PROCESS, { params: dialogParams });
    };

    const processedSteps = useMemo(
        () => createProcessWizardSteps.map(({ meta, ...step }) => ({ ...step, meta: { ...meta, name: t(meta.name) } })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <Wizard.Root
                submitLabel={t('app.createDao.createProcessPage.submitLabel')}
                initialSteps={processedSteps}
                defaultValues={{ stages: [defaultStage] }}
            >
                <Wizard.Form finalStep={t('app.createDao.createProcessPage.finalStep')} onSubmit={handleFormSubmit}>
                    <CreateProcessPageClientSteps steps={processedSteps} daoId={daoId} />
                </Wizard.Form>
            </Wizard.Root>
        </Page.Main>
    );
};
