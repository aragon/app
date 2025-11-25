import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import { PluginInterfaceType, useDao } from '@/shared/api/daoService';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    type ITransactionDialogStepMeta,
    TransactionDialog,
    type TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant } from '@aragon/gov-ui-kit';
import { useCallback, useMemo, useState } from 'react';
import type { TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import type { ICreatePolicyFormData } from '../../components/createPolicyForm';
import { preparePolicyDialogUtils } from './preparePolicyDialogUtils';
import type {
    IBuildPolicyProposalActionsParams,
    IBuildTransactionParams,
    IPreparePolicyMetadata,
} from './preparePolicyDialogUtils.api';

export enum PreparePolicyStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IPreparePolicyDialogParams {
    /**
     * Values of the create-policy form.
     */
    values: ICreatePolicyFormData;
    /**
     * ID of the DAO to prepare the policy for.
     */
    daoId: string;
    /**
     * Plugin address used to create a proposal for adding a new policy.
     */
    pluginAddress: string;
}

export interface IPreparePolicyDialogProps extends IDialogComponentProps<IPreparePolicyDialogParams> {}

export const PreparePolicyDialog: React.FC<IPreparePolicyDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PreparePolicyDialog: required parameters must be set.');
    const { daoId, values, pluginAddress } = location.params;

    const { address } = useAccount();
    invariant(address != null, 'PreparePolicyDialog: user must be connected.');

    const { t } = useTranslations();
    const { status, mutateAsync: pinJson } = usePinJson();
    const { open } = useDialogContext();

    const [policyMetadata, setPolicyMetadata] = useState<IPreparePolicyMetadata>();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const [plugin] = useDaoPlugins({ daoId, pluginAddress }) ?? [];
    invariant(!!plugin, `PreparePolicyDialog: plugin with address "${pluginAddress}" not found.`);

    const isAdmin = plugin.meta.interfaceType === PluginInterfaceType.ADMIN;

    const stepper = useStepper<ITransactionDialogStepMeta, PreparePolicyStep | TransactionDialogStep>({
        initialActiveStep: PreparePolicyStep.PIN_METADATA,
    });
    const { nextStep } = stepper;

    const handlePrepareTransaction = async () => {
        invariant(policyMetadata != null, 'PreparePolicyDialog: metadata not pinned');
        invariant(dao != null, 'PreparePolicyDialog: DAO cannot be fetched');

        const params: IBuildTransactionParams = { values, policyMetadata, dao };
        const transaction = await preparePolicyDialogUtils.buildPreparePolicyTransaction(params);

        return transaction;
    };

    const handlePinJson = useCallback(
        async (params: ITransactionDialogActionParams) => {
            const policyMetadataBody = preparePolicyDialogUtils.preparePolicyMetadata(values);

            const { IpfsHash: policyMetadataHash } = await pinJson({ body: policyMetadataBody }, params);

            const metadata: IPreparePolicyMetadata = { plugin: policyMetadataHash };

            setPolicyMetadata(metadata);
            nextStep();
        },
        [pinJson, nextStep, values],
    );

    const handlePrepareInstallationSuccess = (txReceipt: TransactionReceipt) => {
        invariant(dao != null, 'PreparePolicyDialog: DAO cannot be fetched');

        // TODO: Extract deployment data from transaction receipt
        const deploymentData = {};

        const proposalActionParams: IBuildPolicyProposalActionsParams = {
            values,
            dao,
            deploymentData,
        };
        const proposalActions = preparePolicyDialogUtils.buildPublishPolicyProposalActions(proposalActionParams);

        const proposalMetadata = preparePolicyDialogUtils.preparePublishPolicyProposalMetadata();
        const translationNamespace = `app.capitalFlow.publishPolicyDialog.${isAdmin ? 'admin' : 'default'}`;

        const txInfo = { title: t(`${translationNamespace}.transactionInfoTitle`), current: 2, total: 2 };
        const params: IPublishProposalDialogParams = {
            proposal: { ...proposalMetadata, resources: [], actions: proposalActions },
            daoId,
            plugin: plugin.meta,
            translationNamespace,
            transactionInfo: txInfo,
        };
        open(GovernanceDialogId.PUBLISH_PROPOSAL, { params });
    };

    const pinMetadataNamespace = `app.capitalFlow.preparePolicyDialog.step.${PreparePolicyStep.PIN_METADATA}`;
    const customSteps: Array<ITransactionDialogStep<PreparePolicyStep>> = useMemo(
        () => [
            {
                id: PreparePolicyStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(`${pinMetadataNamespace}.label`),
                    errorLabel: t(`${pinMetadataNamespace}.errorLabel`),
                    state: status,
                    action: handlePinJson,
                    auto: true,
                },
            },
        ],
        [status, handlePinJson, pinMetadataNamespace, t],
    );

    return (
        <TransactionDialog<PreparePolicyStep>
            title={t('app.capitalFlow.preparePolicyDialog.title')}
            description={t('app.capitalFlow.preparePolicyDialog.description')}
            submitLabel={t('app.capitalFlow.preparePolicyDialog.button.submit')}
            onSuccess={handlePrepareInstallationSuccess}
            transactionInfo={{
                title: t('app.capitalFlow.preparePolicyDialog.transactionInfoTitle'),
                current: 1,
                total: 2,
            }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
            network={dao?.network}
        />
    );
};
