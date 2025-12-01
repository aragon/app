import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type IBuildApplyPluginsInstallationActionsParams,
    pluginTransactionUtils,
} from '@/shared/utils/pluginTransactionUtils';
import { type ITransactionRequest, transactionUtils } from '@/shared/utils/transactionUtils';
import { invariant } from '@aragon/gov-ui-kit';
import { encodeAbiParameters, encodeFunctionData, type Hex, zeroAddress } from 'viem';
import type { ICreatePolicyFormData } from '../../components/createPolicyForm';
import { capitalFlowAddresses } from '../../constants/capitalFlowAddresses';
import { RouterType, StrategyType } from '../setupStrategyDialog';
import { StreamingEpochPeriod } from '../setupStrategyDialog/setupStrategyDialogDefinitions';
import { omniSourceFactoryAbi } from './omniSourceFactoryAbi';
import type { IBuildPolicyProposalActionsParams, IBuildTransactionParams } from './preparePolicyDialogUtils.api';
import { routerModelFactoryAbi } from './routerModelFactoryAbi';
import { routerPluginSetupAbi } from './routerPluginSetupAbi';
import { routerSourceFactoryAbi } from './routerSourceFactoryAbi';

const epochPeriodToSeconds = {
    [StreamingEpochPeriod.HOUR]: 60 * 60,
    [StreamingEpochPeriod.DAY]: 24 * 60 * 60,
    [StreamingEpochPeriod.WEEK]: 7 * 24 * 60 * 60,
};

const ratioBase = 1_000_000;

class PreparePolicyDialogUtils {
    private publishPolicyProposalMetadata = {
        title: 'Deploy Capital Flow Policy',
        summary: 'This proposal deploys a new capital flow policy to the DAO',
    };

    normalizeRatios = (values: number[]): number[] => {
        const total = values.reduce((sum, value) => sum + value, 0);
        return values.map((value) => Math.round((value / total) * ratioBase));
    };

    buildDeploySourceAndModelTransaction = async (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, dao } = params;

        const { routerModelFactory, routerSourceFactory, omniSourceFactory } = capitalFlowAddresses[dao.network];
        const { strategy } = values;
        const { sourceVault } = strategy;
        const { address: sourceDaoAddress } = daoUtils.parseDaoId(sourceVault);

        invariant(strategy.type === StrategyType.CAPITAL_ROUTER, `Unsupported strategy type: ${strategy.type}`);

        let deployModelTransaction: ITransactionRequest;
        let deploySourceTransaction: ITransactionRequest;

        if (strategy.routerType === RouterType.FIXED) {
            const { recipients, asset } = strategy.distributionFixed;
            const recipientAddresses = recipients.map((r) => r.address as Hex);
            const ratios = this.normalizeRatios(recipients.map((r) => r.ratio / 100));
            const deployModelCallData = encodeFunctionData({
                abi: routerModelFactoryAbi,
                functionName: 'deployRatioModel',
                args: [recipientAddresses, ratios],
            });
            const deploySourceCallData = encodeFunctionData({
                abi: routerSourceFactoryAbi,
                functionName: 'deployDrainBalanceSource',
                args: [sourceDaoAddress as Hex, asset?.token ? (asset.token.address as Hex) : zeroAddress],
            });

            deployModelTransaction = {
                to: routerModelFactory,
                data: deployModelCallData,
                value: BigInt(0),
            };
            deploySourceTransaction = {
                to: routerSourceFactory,
                data: deploySourceCallData,
                value: BigInt(0),
            };
        } else if (strategy.routerType === RouterType.STREAM) {
            const { recipients, asset, epochPeriod } = strategy.distributionStream;
            const recipientAddresses = recipients.map((r) => r.address as Hex);

            // Calculate total amount and ratios
            const totalAmount = recipients.reduce((sum, r) => sum + Number(r.amount), 0);
            const ratios = this.normalizeRatios(recipients.map((r) => Number(r.amount)));

            const deployModelCallData = encodeFunctionData({
                abi: routerModelFactoryAbi,
                functionName: 'deployRatioModel',
                args: [recipientAddresses, ratios],
            });

            // Calculate amount per epoch based on token decimals or ETH
            const decimals = asset?.token?.decimals ?? 18;
            const amountPerEpoch = BigInt(Math.floor(totalAmount * Math.pow(10, decimals)));
            const epochLengthInSeconds = epochPeriodToSeconds[epochPeriod];

            const deploySourceCallData = encodeFunctionData({
                abi: omniSourceFactoryAbi,
                functionName: 'deployStreamBalanceSource',
                args: [
                    sourceDaoAddress as Hex,
                    asset?.token ? (asset.token.address as Hex) : zeroAddress,
                    amountPerEpoch,
                    BigInt(0),
                    BigInt(epochLengthInSeconds),
                ],
            });

            deployModelTransaction = {
                to: routerModelFactory,
                data: deployModelCallData,
                value: BigInt(0),
            };
            deploySourceTransaction = {
                to: routerSourceFactory,
                data: deploySourceCallData,
                value: BigInt(0),
            };
        } else {
            throw new Error(`Unsupported router type: ${strategy.routerType}`);
        }

        const encodedTransaction = transactionUtils.encodeTransactionRequests(
            [deployModelTransaction, deploySourceTransaction],
            dao.network,
        );

        return Promise.resolve(encodedTransaction);
    };

    preparePolicyMetadata = (values: ICreatePolicyFormData) => {
        const { name, description, policyKey, resources: links } = values;

        return {
            name,
            description,
            policyKey,
            links,
        };
    };

    buildPolicyPrepareInstallationTransaction = async (
        params: IBuildTransactionParams,
    ): Promise<ITransactionRequest> => {
        const { values, sourceAndModelContracts, dao } = params;
        const { strategy } = values;

        invariant(sourceAndModelContracts != null, 'PreparePolicyDialogUtils: source and model contracts are required');
        invariant(strategy.type === StrategyType.CAPITAL_ROUTER, `Unsupported strategy type: ${strategy.type}`);

        const { model, source } = sourceAndModelContracts;
        const { routerPluginRepo } = capitalFlowAddresses[dao.network];

        const isStreamingSource = strategy.routerType === RouterType.STREAM;

        const installationParams = encodeAbiParameters(routerPluginSetupAbi, [source, isStreamingSource, model]);

        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;
        const prepareInstallationData = pluginTransactionUtils.buildPrepareInstallationData(
            routerPluginRepo,
            { release: 1, build: 1 },
            installationParams,
            dao.address as Hex,
        );

        return {
            to: pluginSetupProcessor,
            data: prepareInstallationData,
            value: BigInt(0),
        };
    };

    buildPublishPolicyProposalActions = (params: IBuildPolicyProposalActionsParams): ITransactionRequest[] => {
        const { values, dao, setupData } = params;

        const processorSetupActions: ITransactionRequest[] = [];

        const buildActionsParams: IBuildApplyPluginsInstallationActionsParams = {
            dao,
            setupData,
            actions: processorSetupActions,
            executeConditionAddress: undefined,
        };
        const proposalActions = pluginTransactionUtils.buildApplyPluginsInstallationActions(buildActionsParams);

        return proposalActions;
    };

    preparePublishPolicyProposalMetadata = () => {
        return this.publishPolicyProposalMetadata;
    };
}

export const preparePolicyDialogUtils = new PreparePolicyDialogUtils();
