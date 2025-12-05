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
import { omniModelFactoryAbi } from './omniModelFactoryAbi';
import { omniSourceFactoryAbi } from './omniSourceFactoryAbi';
import type { IBuildPolicyProposalActionsParams, IBuildTransactionParams } from './preparePolicyDialogUtils.api';
import { routerModelFactoryAbi } from './routerModelFactoryAbi';
import { burnRouterPluginSetupAbi, cowSwapRouterPluginSetupAbi, routerPluginSetupAbi } from './routerPluginSetupAbi';
import { routerSourceFactoryAbi } from './routerSourceFactoryAbi';

const epochPeriodToSeconds = {
    [StreamingEpochPeriod.HOUR]: 60 * 60,
    [StreamingEpochPeriod.DAY]: 24 * 60 * 60,
    [StreamingEpochPeriod.WEEK]: 7 * 24 * 60 * 60,
};

// Normalization ratio used in the contracts.
const ratioBase = 1_000_000;

class PreparePolicyDialogUtils {
    private publishPolicyProposalMetadata = {
        title: 'Deploy Capital Flow Policy',
        summary: 'This proposal deploys a new capital flow policy to the DAO',
    };

    normalizeRatios = (values: number[]): number[] => {
        const total = values.reduce((sum, value) => sum + value, 0);
        const ratios = values.map((value) => Math.floor((value / total) * ratioBase));
        const currentSum = ratios.reduce((sum, ratio) => sum + ratio, 0);

        // Distribute the remainder to ensure exact RATIO_BASE sum
        const remainder = ratioBase - currentSum;

        if (remainder !== 0) {
            // Find the index with the largest fractional part to add the remainder
            const fractionalParts = values.map((value, index) => ({
                index,
                fractional: ((value / total) * ratioBase) % 1,
            }));
            fractionalParts.sort((a, b) => b.fractional - a.fractional);

            // Add 1 to the largest fractional parts until remainder is distributed
            for (let i = 0; i < remainder; i++) {
                ratios[fractionalParts[i].index]++;
            }
        }

        const finalSum = ratios.reduce((sum, ratio) => sum + ratio, 0);

        if (finalSum !== ratioBase) {
            throw new Error(`Invalid ratios: sum is ${finalSum.toString()}, expected ${ratioBase.toString()}`);
        }

        return ratios;
    };

    buildDeploySourceAndModelTransaction = async (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, dao } = params;

        const { routerModelFactory, routerSourceFactory, omniSourceFactory, omniModelFactory } =
            capitalFlowAddresses[dao.network];
        const { strategy } = values;
        invariant(
            strategy != null,
            'PreparePolicyDialogUtils->buildDeploySourceAndModelTransaction: strategy is not defined',
        );

        const { sourceVault } = strategy;
        const { address: sourceDaoAddress } = daoUtils.parseDaoId(sourceVault);

        invariant(
            strategy.type === StrategyType.CAPITAL_ROUTER,
            `PreparePolicyDialogUtils->buildDeploySourceAndModelTransaction: unsupported strategy type: ${strategy.type}`,
        );

        let deployModelTransaction: ITransactionRequest;
        let deploySourceTransaction: ITransactionRequest;

        if (strategy.routerType === RouterType.FIXED) {
            const { recipients, asset } = strategy.distributionFixed;
            const recipientAddresses = recipients.map((r) => r.address as Hex);
            const ratios = this.normalizeRatios(recipients.map((r) => r.ratio));

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
        } else if (strategy.routerType === RouterType.GAUGE) {
            const { asset, gaugeVoterAddress } = strategy.distributionGauge;

            const deployModelCallData = encodeFunctionData({
                abi: omniModelFactoryAbi,
                functionName: 'deployAddressGaugeRatioModel',
                args: [gaugeVoterAddress as Hex],
            });
            const deploySourceCallData = encodeFunctionData({
                abi: routerSourceFactoryAbi,
                functionName: 'deployDrainBalanceSource',
                args: [sourceDaoAddress as Hex, asset?.token ? (asset.token.address as Hex) : zeroAddress],
            });

            deployModelTransaction = {
                to: omniModelFactory,
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
            const ratios = this.normalizeRatios(recipients.map((r) => r.ratio));

            const deployModelCallData = encodeFunctionData({
                abi: routerModelFactoryAbi,
                functionName: 'deployRatioModel',
                args: [recipientAddresses, ratios],
            });

            // Maximum safe uint256 value (still effectively unlimited for token amounts)
            const amountPerEpoch = BigInt(2) ** BigInt(255) - BigInt(1);
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
                to: omniSourceFactory,
                data: deploySourceCallData,
                value: BigInt(0),
            };
        } else if (strategy.routerType === RouterType.BURN) {
            // RouterType.BURN deploys only source, no model
            const { asset } = strategy.distributionBurn;

            const deploySourceCallData = encodeFunctionData({
                abi: routerSourceFactoryAbi,
                functionName: 'deployDrainBalanceSource',
                args: [sourceDaoAddress as Hex, asset?.token ? (asset.token.address as Hex) : zeroAddress],
            });
            const deploySourceTransaction = {
                to: routerSourceFactory,
                data: deploySourceCallData,
                value: BigInt(0),
            };

            return Promise.resolve(deploySourceTransaction);
        } else {
            // RouterType.DEX_SWAP deploys only source, no model
            const { asset } = strategy.distributionDexSwap;

            const deploySourceCallData = encodeFunctionData({
                abi: routerSourceFactoryAbi,
                functionName: 'deployDrainBalanceSource',
                args: [sourceDaoAddress as Hex, asset?.token ? (asset.token.address as Hex) : zeroAddress],
            });
            const deploySourceTransaction = {
                to: routerSourceFactory,
                data: deploySourceCallData,
                value: BigInt(0),
            };

            return Promise.resolve(deploySourceTransaction);
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

    buildPolicyPrepareInstallationTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        // TODO: handle policyMetadata here when ready (APP-375)
        const { values, sourceAndModelContracts, dao } = params;
        const { strategy } = values;

        invariant(
            strategy != null,
            'PreparePolicyDialogUtils->buildPolicyPrepareInstallationTransaction: strategy is not defined',
        );
        invariant(
            sourceAndModelContracts != null,
            'PreparePolicyDialogUtils->buildPolicyPrepareInstallationTransaction: source and model contracts are required',
        );
        invariant(
            strategy.type === StrategyType.CAPITAL_ROUTER,
            `PreparePolicyDialogUtils->buildPolicyPrepareInstallationTransaction: unsupported strategy type: ${strategy.type}`,
        );

        const { model, source } = sourceAndModelContracts;
        const { routerPluginRepo, burnRouterPluginRepo, cowSwapRouterPluginRepo } = capitalFlowAddresses[dao.network];

        const isStreamingSource = strategy.routerType === RouterType.STREAM;
        const isBurnRouter = strategy.routerType === RouterType.BURN;

        let installationParams, pluginRepo;

        switch (strategy.routerType) {
            case RouterType.BURN:
                installationParams = encodeAbiParameters(burnRouterPluginSetupAbi, [source, isStreamingSource]);
                pluginRepo = burnRouterPluginRepo;
                break;
            case RouterType.DEX_SWAP: {
                const { targetTokenAddress, cowSwapSettlementAddress } = strategy.distributionDexSwap;
                installationParams = encodeAbiParameters(cowSwapRouterPluginSetupAbi, [
                    source,
                    isStreamingSource,
                    targetTokenAddress as Hex,
                    cowSwapSettlementAddress as Hex,
                ]);
                pluginRepo = cowSwapRouterPluginRepo;
                break;
            }
            default:
                installationParams = encodeAbiParameters(routerPluginSetupAbi, [source, isStreamingSource, model]);
                pluginRepo = routerPluginRepo;
                break;
        }

        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;
        const prepareInstallationData = pluginTransactionUtils.buildPrepareInstallationData(
            pluginRepo,
            { release: 1, build: 1 },
            installationParams,
            dao.address as Hex,
        );

        return Promise.resolve({
            to: pluginSetupProcessor,
            data: prepareInstallationData,
            value: BigInt(0),
        });
    };

    buildPublishPolicyProposalActions = (params: IBuildPolicyProposalActionsParams): ITransactionRequest[] => {
        const { dao, setupData } = params;

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
