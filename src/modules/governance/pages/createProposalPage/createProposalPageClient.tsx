'use client';

import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProposalActionType } from '../../api/governanceService';
import {
    CreateProposalForm,
    type ICreateProposalFormData,
    type PrepareProposalActionFunction,
    type PrepareProposalActionMap,
} from '../../components/createProposalForm';
import { GovernanceDialog } from '../../constants/moduleDialogs';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { type IPublishProposalDialogParams } from '../../dialogs/publishProposalDialog';
import { usePermissionCheckGuard } from '../../hooks/usePermissionCheckGuard';
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
    const router = useRouter();

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const proposalsUrl: __next_route_internal_types__.DynamicRoutes<string> = `/dao/${dao!.id}/proposals`;

    const onPermissionCheckError = useCallback(() => router.push(proposalsUrl), [router, proposalsUrl]);

    const { check: networkGuard, result: isCorrectNetwork } = usePermissionCheckGuard({
        slotId: GovernanceSlotId.GOVERNANCE_CAN_CREATE_PROPOSAL,
        params: { daoId },
        onError: onPermissionCheckError,
        network: dao!.network,
    });

    const [prepareActions, setPrepareActions] = useState<PrepareProposalActionMap>({});

    const addPrepareAction = useCallback(
        (type: ProposalActionType, prepareAction: PrepareProposalActionFunction) =>
            setPrepareActions((current) => ({ ...current, [type]: prepareAction })),
        [],
    );

    const handleFormSubmit = (values: ICreateProposalFormData) => {
        const params: IPublishProposalDialogParams = { values, daoId, pluginAddress, prepareActions };
        open(GovernanceDialog.PUBLISH_PROPOSAL, { params });
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

    useEffect(() => {
        if (!isCorrectNetwork) {
            networkGuard();
        }
    }, [networkGuard, isCorrectNetwork]);

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
                    <CreateProposalPageClientSteps steps={processedSteps} daoId={daoId} pluginAddress={pluginAddress} />
                </CreateProposalForm.Provider>
            </Wizard.Container>
        </Page.Main>
    );
};
