'use client';

import { useConnectedParticipantGuard } from '@/modules/governance/hooks/useConnectedParticipantGuard';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { addressUtils } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import type { ISmartContractAbi } from '../../api/smartContractService';
import {
    CreateProposalForm,
    type ICreateProposalFormData,
    type PrepareProposalActionFunction,
    type PrepareProposalActionMap,
} from '../../components/createProposalForm';
import { GovernanceDialog } from '../../constants/moduleDialogs';
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

    const { isConnected, address } = useAccount();

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const plugin = useDaoPlugins({ daoId, pluginAddress });

    const proposalsUrl: __next_route_internal_types__.DynamicRoutes = `/dao/${dao!.id}/proposals`;

    const onPermissionCheckError = useCallback(() => router.push(proposalsUrl), [router, proposalsUrl]);

    const slotParams = {
        plugin: plugin![0],
        daoId,
        slotId: GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_REQUIREMENTS,
    };
    const { check: checkParticipant } = useConnectedParticipantGuard({
        params: slotParams,
        slotId: GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_REQUIREMENTS,
        onError: onPermissionCheckError,
    });

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

    const [participantChecked, setParticipantChecked] = useState({ checked: false, address: '' });

    useEffect(() => {
        if (!isConnected && !participantChecked.checked) {
            checkParticipant();
            setParticipantChecked({ checked: true, address: address as string });
        }
    }, [checkParticipant, participantChecked.checked, isConnected, address]);

    useEffect(() => {
        if (isConnected && address !== participantChecked.address) {
            checkParticipant();
            setParticipantChecked({ checked: true, address: address as string });
        }
    }, [checkParticipant, isConnected, address, participantChecked.address]);

    useEffect(() => {
        if (address !== participantChecked.address) {
            setParticipantChecked({ checked: false, address: '' });
        }
    }, [address, participantChecked.address]);

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
