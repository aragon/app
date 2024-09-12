'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import { useMemo } from 'react';
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

    const { open } = useDialogContext();
    const { t } = useTranslations();

    // const handleFormSubmit = (values: ICreateProcessFormData) => {
    //     const params: IPublishProcessDialogParams = { values, daoId };
    //     open(GovernanceDialogs.PUBLISH_PROPOSAL, { params });
    // };

    const processedSteps = useMemo(
        () =>
            createProcessWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <Wizard.Container
                finalStep={t('app.governance.createProcessPage.finalStep')}
                submitLabel={t('app.governance.createProcessPage.submitLabel')}
                initialSteps={processedSteps}
                onSubmit={() => null}
                defaultValues={{ stages: [] }}
            >
                <CreateProcessPageClientSteps steps={processedSteps} daoId={daoId} />
            </Wizard.Container>
        </Page.Main>
    );
};
