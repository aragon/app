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
import { decodeEventLog, encodeFunctionData, type Hex, type TransactionReceipt } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import type { ICreatePolicyFormData } from '../../components/createPolicyForm';
import { capitalFlowAddresses } from '../../constants/capitalFlowAddresses';
import { RouterType, StrategyType } from '../../dialogs/setupStrategyDialog';
import { preparePolicyDialogUtils } from './preparePolicyDialogUtils';
import type {
    IBuildPolicyProposalActionsParams,
    IBuildTransactionParams,
    IPreparePolicyMetadata,
    IPrepareSourceAndModelContracts,
} from './preparePolicyDialogUtils.api';
import { routerModelFactoryAbi } from './routerModelFactoryAbi';

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
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

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
        invariant(walletClient != null, 'PreparePolicyDialog: Wallet client not available');
        invariant(publicClient != null, 'PreparePolicyDialog: Public client not available');
        invariant(
            values.strategy.type === StrategyType.CAPITAL_ROUTER,
            'PreparePolicyDialog: Only router strategy supported',
        );

        const factoryAddress = capitalFlowAddresses[dao.network].routerModelFactory;
        const strategy = values.strategy;

        let deployCallData: Hex;

        // Build the appropriate deploy call based on router type
        if (strategy.routerType === RouterType.FIXED) {
            const { recipients } = strategy.distributionFixed;
            const recipientAddresses = recipients.map((r) => r.address as Hex);
            const RATIO_BASE = 1_000_000;
            const ratios = recipients.map((r) => Math.round((r.ratio / 100) * RATIO_BASE));
            deployCallData = encodeFunctionData({
                abi: routerModelFactoryAbi,
                functionName: 'deployRatioModel',
                args: [recipientAddresses, ratios],
            });
        } else if (strategy.routerType === RouterType.STREAM) {
            const { recipients } = strategy.distributionStream;
            const brackets = recipients.map((r) => ({
                recipient: r.address as Hex,
                amount: BigInt(r.amount),
            }));

            deployCallData = encodeFunctionData({
                abi: routerModelFactoryAbi,
                functionName: 'deployBracketsModel',
                args: [brackets],
            });
        } else {
            throw new Error(`Unsupported router type: ${strategy.routerType}`);
        }

        return { to: factoryAddress, data: deployCallData, value: BigInt(0) };
    };

    const handleDeploySourceAndModelSuccess = async (txReceipt: TransactionReceipt) => {
        invariant(dao != null, 'PreparePolicyDialog: DAO not loaded');
        invariant(
            values.strategy.type === StrategyType.CAPITAL_ROUTER,
            'PreparePolicyDialog: Only router strategy supported',
        );

        const strategy = values.strategy;
        const eventName = strategy.routerType === RouterType.FIXED ? 'RatioModelDeployed' : 'BracketsModelDeployed';

        const log = txReceipt.logs.find((log) => {
            try {
                const decoded = decodeEventLog({
                    abi: routerModelFactoryAbi,
                    data: log.data,
                    topics: log.topics,
                });
                return decoded.eventName === eventName;
            } catch {
                return false;
            }
        });

        invariant(log != null, 'PreparePolicyDialog: Model deployment event not found in logs');

        const decodedLog = decodeEventLog({
            abi: routerModelFactoryAbi,
            data: log.data,
            topics: log.topics,
        });

        const modelAddress = (decodedLog.args as { newContract: Hex }).newContract;

        // TODO: Deploy source contract similarly
        const sourceAddress = '0x0000000000000000000000000000000000000000' as Hex;

        setSourceAndModelContracts({ model: modelAddress, source: sourceAddress });
    };

    const handlePrepareInstallationTransaction = async () => {
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

    // Render first dialog: pin metadata and deploy source/model contracts
    if (sourceAndModelContracts == null) {
        return (
            <TransactionDialog<PreparePolicyStep>
                key="mode-source-deploy"
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

    // Render second dialog: prepare plugin installation
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
