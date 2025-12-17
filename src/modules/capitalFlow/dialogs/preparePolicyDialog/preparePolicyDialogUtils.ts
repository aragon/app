import { invariant } from '@aragon/gov-ui-kit';
import { encodeAbiParameters, encodeFunctionData, type Hex, zeroAddress } from 'viem';
import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { type IBuildApplyPluginsInstallationActionsParams, pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { type ITransactionRequest, transactionUtils } from '@/shared/utils/transactionUtils';
import type { ICreatePolicyFormData } from '../../components/createPolicyForm';
import { capitalFlowAddresses } from '../../constants/capitalFlowAddresses';
import { RouterType, StrategyType } from '../setupStrategyDialog';
import { type ISetupStrategyFormRouter, StreamingEpochPeriod } from '../setupStrategyDialog/setupStrategyDialogDefinitions';
import { omniModelFactoryAbi } from './omniModelFactoryAbi';
import { omniSourceFactoryAbi } from './omniSourceFactoryAbi';
import type { IBuildPolicyProposalActionsParams, IBuildTransactionParams } from './preparePolicyDialogUtils.api';
import { routerModelFactoryAbi } from './routerModelFactoryAbi';
import {
    burnRouterPluginSetupAbi,
    cowSwapRouterPluginSetupAbi,
    multiDispatchPluginSetupAbi,
    routerPluginSetupAbi,
    uniswapRouterPluginSetupAbi,
} from './routerPluginSetupAbi';
import { routerSourceFactoryAbi } from './routerSourceFactoryAbi';

const epochPeriodToSeconds: Record<StreamingEpochPeriod, number> = {
    [StreamingEpochPeriod.HOUR]: 60 * 60,
    [StreamingEpochPeriod.DAY]: 24 * 60 * 60,
    [StreamingEpochPeriod.WEEK]: 7 * 24 * 60 * 60,
};

// Normalization ratio used in the contracts.
const ratioBase = 1_000_000;

class PreparePolicyDialogUtils {
    private readonly publishPolicyProposalMetadata = {
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
                ratios[fractionalParts[i].index] += 1;
            }
        }

        const finalSum = ratios.reduce((sum, ratio) => sum + ratio, 0);

        if (finalSum !== ratioBase) {
            throw new Error(`Invalid ratios: sum is ${finalSum.toString()}, expected ${ratioBase.toString()}`);
        }

        return ratios;
    };

    /**
     * Creates a no-op transaction that does nothing when executed.
     * Used for router types that don't require source or model deployment (e.g., MULTI_DISPATCH).
     *
     * @returns A zero-value transaction to zeroAddress with empty data.
     */
    buildNoOpTransaction = (): ITransactionRequest => ({
        to: zeroAddress,
        data: '0x',
        value: BigInt(0),
    });

    buildDeploySourceAndModelTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, dao } = params;
        const { strategy } = values;
        invariant(strategy != null, 'PreparePolicyDialogUtils->buildDeploySourceAndModelTransaction: strategy is not defined');
        invariant(
            strategy.type === StrategyType.CAPITAL_ROUTER,
            `PreparePolicyDialogUtils->buildDeploySourceAndModelTransaction: unsupported strategy type: ${strategy.type}`
        );

        const { sourceVault } = strategy;
        const { address: sourceDaoAddress } = daoUtils.parseDaoId(sourceVault);
        const routerStrategy = strategy as ISetupStrategyFormRouter;
        const routerTransactions = this.buildRouterTransactions(routerStrategy, dao.network, sourceDaoAddress as Hex);

        if (routerTransactions.length === 0) {
            return Promise.resolve(this.buildNoOpTransaction());
        }

        if (routerTransactions.length === 1) {
            return Promise.resolve(routerTransactions[0]);
        }

        const encodedTransaction = transactionUtils.encodeTransactionRequests(routerTransactions, dao.network);
        return Promise.resolve(encodedTransaction);
    };

    private readonly buildRouterTransactions = (strategy: ISetupStrategyFormRouter, network: Network, sourceDao: Hex) => {
        const { routerModelFactory, routerSourceFactory, omniSourceFactory, omniModelFactory } = capitalFlowAddresses[network];

        switch (strategy.routerType) {
            case RouterType.FIXED: {
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
                    args: [sourceDao, asset?.token ? (asset.token.address as Hex) : zeroAddress],
                });

                return [
                    {
                        to: routerModelFactory,
                        data: deployModelCallData,
                        value: BigInt(0),
                    },
                    {
                        to: routerSourceFactory,
                        data: deploySourceCallData,
                        value: BigInt(0),
                    },
                ];
            }
            case RouterType.GAUGE: {
                const { asset, gaugeVoterAddress } = strategy.distributionGauge;

                const deployModelCallData = encodeFunctionData({
                    abi: omniModelFactoryAbi,
                    functionName: 'deployAddressGaugeRatioModel',
                    args: [gaugeVoterAddress as Hex],
                });
                const deploySourceCallData = encodeFunctionData({
                    abi: routerSourceFactoryAbi,
                    functionName: 'deployDrainBalanceSource',
                    args: [sourceDao, asset?.token ? (asset.token.address as Hex) : zeroAddress],
                });

                return [
                    {
                        to: omniModelFactory,
                        data: deployModelCallData,
                        value: BigInt(0),
                    },
                    {
                        to: routerSourceFactory,
                        data: deploySourceCallData,
                        value: BigInt(0),
                    },
                ];
            }
            case RouterType.STREAM: {
                const { recipients, asset, epochPeriod } = strategy.distributionStream;
                const recipientAddresses = recipients.map((r) => r.address as Hex);
                const ratios = this.normalizeRatios(recipients.map((r) => r.ratio));

                const deployModelCallData = encodeFunctionData({
                    abi: routerModelFactoryAbi,
                    functionName: 'deployRatioModel',
                    args: [recipientAddresses, ratios],
                });

                const amountPerEpoch = BigInt(2) ** BigInt(255) - BigInt(1);
                const epochLengthInSeconds = epochPeriodToSeconds[epochPeriod];

                const deploySourceCallData = encodeFunctionData({
                    abi: omniSourceFactoryAbi,
                    functionName: 'deployStreamBalanceSource',
                    args: [
                        sourceDao,
                        asset?.token ? (asset.token.address as Hex) : zeroAddress,
                        amountPerEpoch,
                        BigInt(0),
                        BigInt(epochLengthInSeconds),
                    ],
                });

                return [
                    {
                        to: routerModelFactory,
                        data: deployModelCallData,
                        value: BigInt(0),
                    },
                    {
                        to: omniSourceFactory,
                        data: deploySourceCallData,
                        value: BigInt(0),
                    },
                ];
            }
            case RouterType.BURN: {
                const { asset } = strategy.distributionBurn;
                const deploySourceCallData = encodeFunctionData({
                    abi: routerSourceFactoryAbi,
                    functionName: 'deployDrainBalanceSource',
                    args: [sourceDao, asset?.token ? (asset.token.address as Hex) : zeroAddress],
                });
                return [
                    {
                        to: routerSourceFactory,
                        data: deploySourceCallData,
                        value: BigInt(0),
                    },
                ];
            }
            case RouterType.DEX_SWAP: {
                const { asset } = strategy.distributionDexSwap;
                const deploySourceCallData = encodeFunctionData({
                    abi: routerSourceFactoryAbi,
                    functionName: 'deployDrainBalanceSource',
                    args: [sourceDao, asset?.token ? (asset.token.address as Hex) : zeroAddress],
                });
                return [
                    {
                        to: routerSourceFactory,
                        data: deploySourceCallData,
                        value: BigInt(0),
                    },
                ];
            }
            case RouterType.UNISWAP: {
                const { asset } = strategy.distributionUniswap;
                const deploySourceCallData = encodeFunctionData({
                    abi: routerSourceFactoryAbi,
                    functionName: 'deployDrainBalanceSource',
                    args: [sourceDao, asset?.token ? (asset.token.address as Hex) : zeroAddress],
                });
                return [
                    {
                        to: routerSourceFactory,
                        data: deploySourceCallData,
                        value: BigInt(0),
                    },
                ];
            }
            default:
                return [];
        }
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
        const { values, sourceAndModelContracts, dao, policyMetadata } = params;
        const { strategy } = values;

        const pluginMetadata = policyMetadata?.plugin;
        const pluginMetadataHex = pluginMetadata ? transactionUtils.stringToMetadataHex(pluginMetadata) : '0x';

        invariant(strategy != null, 'PreparePolicyDialogUtils->buildPolicyPrepareInstallationTransaction: strategy is not defined');
        invariant(
            sourceAndModelContracts != null,
            'PreparePolicyDialogUtils->buildPolicyPrepareInstallationTransaction: source and model contracts are required'
        );
        invariant(
            strategy.type === StrategyType.CAPITAL_ROUTER,
            `PreparePolicyDialogUtils->buildPolicyPrepareInstallationTransaction: unsupported strategy type: ${strategy.type}`
        );

        const { model, source } = sourceAndModelContracts;
        const { routerPluginRepo, burnRouterPluginRepo, cowSwapRouterPluginRepo, multiDispatchRouterPluginRepo, uniswapRouterPluginRepo } =
            capitalFlowAddresses[dao.network];

        const isStreamingSource = strategy.routerType === RouterType.STREAM;

        let installationParams: Hex;
        let pluginRepo: Hex;

        switch (strategy.routerType) {
            case RouterType.BURN:
                installationParams = encodeAbiParameters(burnRouterPluginSetupAbi, [source, isStreamingSource, pluginMetadataHex]);
                pluginRepo = burnRouterPluginRepo;
                break;
            case RouterType.DEX_SWAP: {
                const { targetTokenAddress, cowSwapSettlementAddress } = strategy.distributionDexSwap;
                installationParams = encodeAbiParameters(cowSwapRouterPluginSetupAbi, [
                    source,
                    isStreamingSource,
                    targetTokenAddress as Hex,
                    cowSwapSettlementAddress as Hex,
                    pluginMetadataHex,
                ]);
                pluginRepo = cowSwapRouterPluginRepo;
                break;
            }
            case RouterType.MULTI_DISPATCH: {
                const { routerAddresses } = strategy.distributionMultiDispatch;
                // Filter out any empty addresses to ensure only valid Hex addresses are encoded
                const addresses = routerAddresses.filter((r) => r.address && r.address.trim() !== '').map((r) => r.address as Hex);
                installationParams = encodeAbiParameters(multiDispatchPluginSetupAbi, [addresses, pluginMetadataHex]);
                pluginRepo = multiDispatchRouterPluginRepo;
                break;
            }
            case RouterType.UNISWAP: {
                const { targetTokenAddress, uniswapRouterAddress } = strategy.distributionUniswap;
                installationParams = encodeAbiParameters(uniswapRouterPluginSetupAbi, [
                    source,
                    isStreamingSource,
                    targetTokenAddress as Hex,
                    uniswapRouterAddress as Hex,
                    pluginMetadataHex,
                ]);
                pluginRepo = uniswapRouterPluginRepo;
                break;
            }
            default:
                installationParams = encodeAbiParameters(routerPluginSetupAbi, [source, isStreamingSource, model, pluginMetadataHex]);
                pluginRepo = routerPluginRepo;
                break;
        }

        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;
        const prepareInstallationData = pluginTransactionUtils.buildPrepareInstallationData(
            pluginRepo,
            { release: 1, build: 1 },
            installationParams,
            dao.address as Hex
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

    preparePublishPolicyProposalMetadata = () => this.publishPolicyProposalMetadata;
}

export const preparePolicyDialogUtils = new PreparePolicyDialogUtils();
