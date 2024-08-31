'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import { useMemo } from 'react';
import { type ICreateProposalFormData } from '../../components/createProposalForm';
import { CreateProposalPageClientSteps } from './createProposalPageClientSteps';
import { createProposalWizardSteps } from './createProposalPageDefinitions';

export interface ICreateProposalPageClientProps {}

export const CreateProposalPageClient: React.FC<ICreateProposalPageClientProps> = () => {
    const { t } = useTranslations();

    const handleFormSubmit = (values: ICreateProposalFormData) => {
        // eslint-disable-next-line no-console
        console.log({ values });
    };

    const processedSteps = useMemo(
        () =>
            createProposalWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <Wizard.Container
                finalStep={t('app.governance.createProposalPage.finalStep')}
                submitLabel={t('app.governance.createProposalPage.submitLabel')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
            >
                <CreateProposalPageClientSteps steps={processedSteps} />
            </Wizard.Container>
        </Page.Main>
    );
};
