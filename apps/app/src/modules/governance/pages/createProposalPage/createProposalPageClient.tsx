'use client';

import { useCallback, useMemo, useState } from 'react';
import { TransactionType } from '@/shared/api/transactionService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { pendingTransactionManager } from '@/shared/utils/pendingTransactionManager';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import {
    CreateProposalForm,
    type ICreateProposalFormData,
} from '../../components/createProposalForm';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type {
    IPublishProposalDialogParams,
    PrepareProposalActionFunction,
    PrepareProposalActionMap,
} from '../../dialogs/publishProposalDialog';
// Imported directly (not via the dialog barrel) so the guard doesn't pull the dialog into this bundle.
import { publishProposalDialogUtils } from '../../dialogs/publishProposalDialog/publishProposalDialogUtils';
import { useProposalPermissionCheckGuard } from '../../hooks/useProposalPermissionCheckGuard';
import { proposalResumeRegistry } from '../../utils/proposalResumeRegistry';
import { CreateProposalPageClientSteps } from './createProposalPageClientSteps';
import {
    createProposalWizardId,
    createProposalWizardSteps,
} from './createProposalPageDefinitions';

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

export const CreateProposalPageClient: React.FC<
    ICreateProposalPageClientProps
> = (props) => {
    const { daoId, pluginAddress } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { meta: plugin } = useDaoPlugins({
        daoId,
        pluginAddress,
        includeLinkedAccounts: true,
    })![0];

    useProposalPermissionCheckGuard({
        daoId,
        pluginAddress,
        redirectTab: 'proposals',
    });

    const [prepareActions, setPrepareActions] =
        useState<PrepareProposalActionMap>({});

    const addPrepareAction = useCallback(
        (type: string, prepareAction: PrepareProposalActionFunction) =>
            setPrepareActions((current) => ({
                ...current,
                [type]: prepareAction,
            })),
        [],
    );

    const contextValues = useMemo(
        () => ({ prepareActions, addPrepareAction, processPlugin: plugin }),
        [prepareActions, addPrepareAction, plugin],
    );

    const handleFormSubmit = (values: ICreateProposalFormData) => {
        // We are always saving actions on the form so that user doesn't lose them if they navigate around the form.
        const { actions, addActions } = values;
        const proposal = { ...values, actions: addActions ? actions : [] };
        const params: IPublishProposalDialogParams = {
            proposal,
            daoId,
            plugin,
            prepareActions,
        };

        // Editing the form after closing the dialog produces a new intentId, so the prior in-flight
        // proposal creation is no longer resumed and a fresh submit would create a second proposal.
        // Warn when another proposal creation for this DAO + plugin is still pending/submitted; an
        // unchanged form shares the intentId and resumes as before (no conflict, no warning).
        const intentId = publishProposalDialogUtils.buildProposalIntentId({
            daoId,
            plugin,
            proposal,
        });
        const scope = publishProposalDialogUtils.buildProposalScope(
            daoId,
            plugin.address,
        );
        const conflictFilter = {
            type: TransactionType.PROPOSAL_CREATE,
            scope,
            excludeIntentId: intentId,
        };

        const trackWizardSubmit = () => {
            const actionCount = proposal.actions.length;
            plausibleAnalyticsUtils.track('wizard_submit', {
                flow: 'create_proposal',
                actionCount,
                hasActions: actionCount > 0,
                pluginInterfaceType: plugin.interfaceType,
            });
        };

        const openPublishDialog = () => {
            // "New transaction" / no conflict: the user has committed to this proposal, so supersede any
            // other in-flight creation for this DAO + plugin that would otherwise keep warning forever.
            pendingTransactionManager.clearActive(conflictFilter);
            proposalResumeRegistry.set(intentId, params);
            trackWizardSubmit();
            open(GovernanceDialogId.PUBLISH_PROPOSAL, { params });
        };

        const conflicts = pendingTransactionManager.getActive(conflictFilter);

        if (conflicts.length > 0) {
            // Offer to resume the conflicting in-flight creation when we still hold the params needed
            // to reopen its dialog (session-scoped; lost after a reload).
            const resumeParams = conflicts
                .map(([id]) => proposalResumeRegistry.get(id))
                .find((registered) => registered != null);
            const onResume =
                resumeParams != null
                    ? () =>
                          open(GovernanceDialogId.PUBLISH_PROPOSAL, {
                              params: resumeParams,
                          })
                    : undefined;

            open(GovernanceDialogId.DUPLICATE_PROPOSAL_WARNING, {
                params: { onProceed: openPublishDialog, onResume },
            });
            return;
        }

        openPublishDialog();
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
                analytics={{
                    flow: 'create_proposal',
                    props: { pluginInterfaceType: plugin.interfaceType },
                }}
                defaultValues={{ actions: [] }}
                finalStep={t('app.governance.createProposalPage.finalStep')}
                id={createProposalWizardId}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                submitLabel={t('app.governance.createProposalPage.submitLabel')}
            >
                <CreateProposalForm.Provider value={contextValues}>
                    <CreateProposalPageClientSteps
                        daoId={daoId}
                        pluginAddress={pluginAddress}
                        steps={processedSteps}
                    />
                </CreateProposalForm.Provider>
            </WizardPage.Container>
        </Page.Main>
    );
};
