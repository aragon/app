'use client';

import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { addressUtils } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ISmartContractAbi } from '../../api/smartContractService';
import {
    CreateProposalForm,
    type ICreateProposalFormData,
    type PrepareProposalActionFunction,
    type PrepareProposalActionMap,
} from '../../components/createProposalForm';
import { GovernanceDialog } from '../../constants/governanceDialogId';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { type IPublishProposalDialogParams } from '../../dialogs/publishProposalDialog';
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

    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress })![0];

    const handlePermissionCheckError = useCallback(() => router.push(`/dao/${daoId}/proposals`), [router, daoId]);

    const { check: createProposalGuard, result: canCreateProposal } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onError: handlePermissionCheckError,
        plugin,
        daoId,
    });

    useEffect(() => {
        if (!canCreateProposal) {
            createProposalGuard();
        }
    }, [canCreateProposal, createProposalGuard]);

    const [prepareActions, setPrepareActions] = useState<PrepareProposalActionMap>({});
    const [smartContractAbis, setSmartContractAbis] = useState<ISmartContractAbi[]>([]);

    const addPrepareAction = useCallback(
        (type: string, prepareAction: PrepareProposalActionFunction) =>
            setPrepareActions((current) => ({ ...current, [type]: prepareAction })),
        [],
    );

    const addSmartContractAbi = useCallback(
        (abi: ISmartContractAbi) =>
            setSmartContractAbis((current) => {
                const alreadyExists = current.some((currentAbi) =>
                    addressUtils.isAddressEqual(currentAbi.address, abi.address),
                );

                return alreadyExists ? current : [abi, ...current];
            }),
        [],
    );

    const handleFormSubmit = (values: ICreateProposalFormData) => {
        const params: IPublishProposalDialogParams = { values, daoId, pluginAddress, prepareActions };
        open(GovernanceDialog.PUBLISH_PROPOSAL, { params });
    };

    const contextValues = useMemo(
        () => ({ prepareActions, addPrepareAction, smartContractAbis, addSmartContractAbi }),
        [prepareActions, addPrepareAction, smartContractAbis, addSmartContractAbi],
    );

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
                <CreateProposalForm.Provider value={contextValues}>
                    <CreateProposalPageClientSteps steps={processedSteps} daoId={daoId} pluginAddress={pluginAddress} />
                </CreateProposalForm.Provider>
            </WizardPage.Container>
        </Page.Main>
    );
};
