import { type ITransactionRequest, transactionUtils } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, type Hex, zeroAddress } from 'viem';
import { daoUtils } from '../../../../shared/utils/daoUtils';
import type { ICreatePolicyFormData } from '../../components/createPolicyForm';
import { capitalFlowAddresses } from '../../constants/capitalFlowAddresses';
import { RouterType, StrategyType } from '../setupStrategyDialog';
import { StreamingEpochPeriod } from '../setupStrategyDialog/setupStrategyDialogDefinitions';
import type { IBuildPolicyProposalActionsParams, IBuildTransactionParams } from './preparePolicyDialogUtils.api';
import { routerModelFactoryAbi } from './routerModelFactoryAbi';
import { routerSourceFactoryAbi } from './routerSourceFactoryAbi';

const epochPeriodToSeconds = {
    [StreamingEpochPeriod.HOUR]: 60 * 60,
    [StreamingEpochPeriod.DAY]: 24 * 60 * 60,
    [StreamingEpochPeriod.WEEK]: 7 * 24 * 60 * 60,
};

class PreparePolicyDialogUtils {
    private publishPolicyProposalMetadata = {
        title: 'Deploy Capital Flow Policy',
        summary: 'This proposal deploys a new capital flow policy to the DAO',
    };

    buildDeploySourceAndModelTransaction = async (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, dao } = params;

        const { routerModelFactory, routerSourceFactory, omniSourceFactory } = capitalFlowAddresses[dao.network];
        const { strategy } = values;
        const { sourceVault } = strategy;
        const { address: sourceDaoAddress } = daoUtils.parseDaoId(sourceVault);

        if (strategy.type !== StrategyType.CAPITAL_ROUTER) {
            throw new Error(`Unsupported strategy type: ${strategy.type}`);
        }

        let deployModelTransaction: ITransactionRequest;
        let deploySourceTransaction: ITransactionRequest;

        if (strategy.routerType === RouterType.FIXED) {
            const { recipients, asset } = strategy.distributionFixed;
            const recipientAddresses = recipients.map((r) => r.address as Hex);
            const RATIO_BASE = 1_000_000;
            const ratios = recipients.map((r) => Math.round((r.ratio / 100) * RATIO_BASE));
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
            const RATIO_BASE = 1_000_000;
            const ratios = recipients.map((r) => Math.round((Number(r.amount) / totalAmount) * RATIO_BASE));

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

    buildPreparePolicyTransaction = async (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, policyMetadata, dao } = params;

        // Placeholder implementation
        const transactions: Array<{ to: Hex; value: bigint; data: Hex }> = [];

        // Example: Deploy strategy contract
        // const strategyDeployData = this.buildDeployStrategyData(values.strategy);
        // transactions.push({
        //     to: strategyFactoryAddress as Hex,
        //     value: BigInt(0),
        //     data: strategyDeployData as Hex,
        // });

        const encodedTransaction = transactionUtils.encodeTransactionRequests(transactions, dao.network);

        return encodedTransaction;
    };

    buildPublishPolicyProposalActions = (params: IBuildPolicyProposalActionsParams): ITransactionRequest[] => {
        const { values, dao, deploymentData } = params;

        // TODO: Build the actual proposal actions
        // This should create actions to:
        // 1. Grant necessary permissions to the deployed strategy
        // 2. Configure policy parameters
        // 3. Activate the policy

        // Placeholder implementation
        const actions: ITransactionRequest[] = [];

        return actions;
    };

    preparePublishPolicyProposalMetadata = () => {
        return this.publishPolicyProposalMetadata;
    };

    private buildSourceAndModelDeployActionData = (params: IBuildTransactionParams) => {};
    private buildPrepareInstallPluginActionData = (params: IBuildTransactionParams) => {};
}

export const preparePolicyDialogUtils = new PreparePolicyDialogUtils();
