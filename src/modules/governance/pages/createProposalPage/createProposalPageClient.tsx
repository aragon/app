'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { addressUtils } from '@aragon/gov-ui-kit';
import { useCallback, useMemo, useState } from 'react';
import type { ISmartContractAbi } from '../../api/smartContractService';
import { CreateProposalForm, type ICreateProposalFormData } from '../../components/createProposalForm';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type {
    IPublishProposalDialogParams,
    PrepareProposalActionFunction,
    PrepareProposalActionMap,
} from '../../dialogs/publishProposalDialog';
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

    useProposalPermissionCheckGuard({ daoId, pluginAddress, redirectTab: 'proposals' });

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
        // We are always saving actions on the form so that user doesn't lose them if they navigate around the form.
        const { actions, addActions } = values;
        const proposal = { ...values, actions: addActions ? actions : [] };
        const params: IPublishProposalDialogParams = { proposal, daoId, plugin, prepareActions };
        open(GovernanceDialogId.PUBLISH_PROPOSAL, { params });
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
