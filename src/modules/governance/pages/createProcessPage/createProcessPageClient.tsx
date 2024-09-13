'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import { useMemo } from 'react';
import type { ICreateProcessFormData, ICreateProcessFormStage } from '../../components/createProcessForm';
import { createProcessWizardSteps } from './createProcessPageDefinitions';
import { CreateProcessPageClientSteps } from './createProcessPageSteps';

export interface ICreateProcessPageClientProps {
    /**
     * ID of the current DAO.
     */
    daoId: string;
}

const defaultStage: ICreateProcessFormStage = {
    name: '',
    type: 'normal',
    votingPeriod: { days: 7, minutes: 0, hours: 0 },
    earlyStageAdvance: false,
    stageExpiration: false,
    votingBodies: [],
};

export const CreateProcessPageClient: React.FC<ICreateProcessPageClientProps> = (props) => {
    const { daoId } = props;

    const { open } = useDialogContext();
    const { t } = useTranslations();

    const handleFormSubmit = (values: ICreateProcessFormData) => {
        console.log(values);
    };

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
                finalStep="Publish Process"
                submitLabel="Publish Process"
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                defaultValues={{ stages: [defaultStage] }}
            >
                <CreateProcessPageClientSteps steps={processedSteps} daoId={daoId} />
            </Wizard.Container>
        </Page.Main>
    );
};
