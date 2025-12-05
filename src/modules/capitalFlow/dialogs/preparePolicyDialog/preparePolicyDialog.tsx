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
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant } from '@aragon/gov-ui-kit';
import { useCallback, useMemo, useState } from 'react';
import { type Hex, parseEventLogs, type TransactionReceipt, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { pluginTransactionUtils } from '../../../../shared/utils/pluginTransactionUtils';
import type { ICreatePolicyFormData } from '../../components/createPolicyForm';
import { RouterType, StrategyType } from '../setupStrategyDialog';
import { omniModelFactoryAbi } from './omniModelFactoryAbi';
import { omniSourceFactoryAbi } from './omniSourceFactoryAbi';
import { preparePolicyDialogUtils } from './preparePolicyDialogUtils';
import type {
    IBuildPolicyProposalActionsParams,
    IBuildTransactionParams,
    IPreparePolicyMetadata,
    IPrepareSourceAndModelContracts,
} from './preparePolicyDialogUtils.api';
import { routerModelFactoryAbi } from './routerModelFactoryAbi';
import { routerSourceFactoryAbi } from './routerSourceFactoryAbi';

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
    const [sourceAndModelContracts, setSourceAndModelContracts] = useState<IPrepareSourceAndModelContracts>();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const [plugin] = useDaoPlugins({ daoId, pluginAddress }) ?? [];
    invariant(!!plugin, `PreparePolicyDialog: plugin with address "${pluginAddress}" not found.`);

    const isAdmin = plugin.meta.interfaceType === PluginInterfaceType.ADMIN;

    const deploymentStepper = useStepper<ITransactionDialogStepMeta, PreparePolicyStep | TransactionDialogStep>({
        initialActiveStep: PreparePolicyStep.PIN_METADATA,
    });
    const installationStepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });
    const { nextStep } = deploymentStepper;

    const handleDeploySourceAndModelTransaction = async () => {
        invariant(dao != null, 'PreparePolicyDialog: DAO not loaded');

        const transaction = preparePolicyDialogUtils.buildDeploySourceAndModelTransaction({
            values,
            dao,
        });

        return transaction;
    };

    const handleDeploySourceAndModelSuccess = (txReceipt: TransactionReceipt) => {
        const combinedModelAbi = [...routerModelFactoryAbi, ...omniModelFactoryAbi] as const;
        const modelLogs = parseEventLogs({
            abi: combinedModelAbi,
            logs: txReceipt.logs,
            strict: false,
        });

        invariant(values.strategy != null, 'handleDeploySourceAndModelSuccess: strategy is not defined');
        const hasModel =
            values.strategy.type === StrategyType.CAPITAL_ROUTER &&
            ![RouterType.BURN, RouterType.DEX_SWAP].includes(values.strategy.routerType);

        invariant(
            // BURN does not deploy model
            hasModel ? modelLogs.length > 0 : modelLogs.length === 0,
            'PreparePolicyDialog: Unexpected state in model deployment event logs',
        );
        const modelAddress = hasModel ? (modelLogs[0].args.newContract as Hex) : zeroAddress;

        const combinedSourceAbi = [...routerSourceFactoryAbi, ...omniSourceFactoryAbi] as const;
        const sourceLogs = parseEventLogs({
            abi: combinedSourceAbi,
            logs: txReceipt.logs,
            strict: false,
        });

        invariant(sourceLogs.length > 0, 'PreparePolicyDialog: Source deployment event not found in logs');
        const sourceAddress = sourceLogs[0].args.newContract as Hex;

        setSourceAndModelContracts({ model: modelAddress, source: sourceAddress });
    };

    const handlePrepareInstallationTransaction = async () => {
        invariant(policyMetadata != null, 'PreparePolicyDialog: metadata not pinned');
        invariant(dao != null, 'PreparePolicyDialog: DAO not loaded');
        invariant(sourceAndModelContracts != null, 'PreparePolicyDialog: source and model contracts not deployed');

        const params: IBuildTransactionParams = { values, policyMetadata, dao, sourceAndModelContracts };
        const transaction = await preparePolicyDialogUtils.buildPolicyPrepareInstallationTransaction(params);

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

        const setupData = pluginTransactionUtils.getPluginInstallationSetupData(txReceipt);

        const proposalActionParams: IBuildPolicyProposalActionsParams = {
            values,
            dao,
            setupData,
        };
        const proposalActions = preparePolicyDialogUtils.buildPublishPolicyProposalActions(proposalActionParams);

        const proposalMetadata = preparePolicyDialogUtils.preparePublishPolicyProposalMetadata();
        const translationNamespace = `app.capitalFlow.publishPolicyDialog.${isAdmin ? 'admin' : 'default'}`;

        const txInfo = { title: t(`${translationNamespace}.transactionInfoTitle`), current: 3, total: 3 };
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

    // We have 2 instances of TransactionDialog:
    // - the first one to pin metadata and deploy source/model contracts, and
    // - the second one to call prepareInstallation on plugin setup contract.
    // - after that we open publish proposal dialog as the third step, as usual.
    if (sourceAndModelContracts == null) {
        return (
            <TransactionDialog<PreparePolicyStep>
                key="model-and-source-deploy"
                title={t('app.capitalFlow.preparePolicyDialog.title')}
                description={t('app.capitalFlow.preparePolicyDialog.description')}
                submitLabel={t('app.capitalFlow.preparePolicyDialog.button.submit')}
                onSuccess={handleDeploySourceAndModelSuccess}
                transactionInfo={{
                    title: t('app.capitalFlow.preparePolicyDialog.transactionInfoTitleDeploy'),
                    current: 1,
                    total: 3,
                }}
                stepper={deploymentStepper}
                customSteps={customSteps}
                prepareTransaction={handleDeploySourceAndModelTransaction}
                network={dao?.network}
            />
        );
    }

    return (
        <TransactionDialog
            key="plugin-install"
            title={t('app.capitalFlow.preparePolicyDialog.title')}
            description={t('app.capitalFlow.preparePolicyDialog.description')}
            submitLabel={t('app.capitalFlow.preparePolicyDialog.button.submit')}
            onSuccess={handlePrepareInstallationSuccess}
            transactionInfo={{
                title: t('app.capitalFlow.preparePolicyDialog.transactionInfoTitleInstall'),
                current: 2,
                total: 3,
            }}
            stepper={installationStepper}
            prepareTransaction={handlePrepareInstallationTransaction}
            network={dao?.network}
        />
    );
};
