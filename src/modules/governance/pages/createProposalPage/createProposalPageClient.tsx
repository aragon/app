'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useMemo } from 'react';
import { type ICreateProposalFormData } from '../../components/createProposalForm';
import { useActionsContext } from '../../components/createProposalForm/actionsProvider';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { IPublishProposalDialogParams } from '../../dialogs/publishProposalDialog';
import { useProposalPermissionCheckGuard } from '../../hooks/useProposalPermissionCheckGuard';
import { CreateProposalPageClientSteps } from './createProposalPageClientSteps';
import { createProposalWizardSteps } from './createProposalPageDefinitions';

export interface ICreateProposalPageClientProps {
    /**
     * ID of the DAO to create a proposal for.
     */
    daoId: string;
    /**
     * Address of the plugin to create the proposal for.
     */
    pluginAddress: string;
}

export const CreateProposalPageClient: React.FC<ICreateProposalPageClientProps> = (props) => {
    const { daoId, pluginAddress } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress })![0];
    const { prepareActions } = useActionsContext();

    useProposalPermissionCheckGuard({ daoId, pluginAddress, redirectTab: 'proposals' });

    const handleFormSubmit = (values: ICreateProposalFormData) => {
        // We are always saving actions on the form so that user doesn't lose them if they navigate around the form.
        const { actions, addActions } = values;
        const proposal = { ...values, actions: addActions ? actions : [] };
        const params: IPublishProposalDialogParams = { proposal, daoId, plugin, prepareActions };
        open(GovernanceDialogId.PUBLISH_PROPOSAL, { params });
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
            <WizardPage.Container
                finalStep={t('app.governance.createProposalPage.finalStep')}
                submitLabel={t('app.governance.createProposalPage.submitLabel')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                defaultValues={{ actions: [] }}
            >
                <CreateProposalPageClientSteps steps={processedSteps} daoId={daoId} pluginAddress={pluginAddress} />
            </WizardPage.Container>
        </Page.Main>
    );
};
