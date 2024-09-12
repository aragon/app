'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import { useCallback, useMemo, useState } from 'react';
import type { ProposalActionType } from '../../api/governanceService';
import {
    CreateProposalForm,
    type ICreateProposalFormContext,
    type ICreateProposalFormData,
    type PrepareProposalActionFunction,
} from '../../components/createProposalForm';
import { GovernanceDialogs } from '../../constants/moduleDialogs';
import { type IPublishProposalDialogParams } from '../../dialogs/publishProposalDialog';
import { CreateProposalPageClientSteps } from './createProposalPageClientSteps';
import { createProposalWizardSteps } from './createProposalPageDefinitions';

export interface ICreateProposalPageClientProps {
    /**
     * ID of the current DAO.
     */
    daoId: string;
}

export const CreateProposalPageClient: React.FC<ICreateProposalPageClientProps> = (props) => {
    const { daoId } = props;

    const { open } = useDialogContext();
    const { t } = useTranslations();

    const [prepareActions, setPrepareActions] = useState<ICreateProposalFormContext['prepareActions']>({});

    const addPrepareAction = useCallback(
        (type: ProposalActionType, prepareAction: PrepareProposalActionFunction) =>
            setPrepareActions((current) => ({ ...current, [type]: prepareAction })),
        [],
    );

    const handleFormSubmit = (values: ICreateProposalFormData) => {
        const params: IPublishProposalDialogParams = { values, daoId, prepareActions };
        open(GovernanceDialogs.PUBLISH_PROPOSAL, { params });
    };

    const contextValues = useMemo(() => ({ prepareActions, addPrepareAction }), [prepareActions, addPrepareAction]);

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
                defaultValues={{ actions: [] }}
            >
                <CreateProposalForm.Provider value={contextValues}>
                    <CreateProposalPageClientSteps steps={processedSteps} daoId={daoId} />
                </CreateProposalForm.Provider>
            </Wizard.Container>
        </Page.Main>
    );
};
