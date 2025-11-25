import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import type { IDao } from '@/shared/api/daoService';
import { transactionUtils, type ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { Hex } from 'viem';
import type { ICreatePolicyFormData } from '../../components/createPolicyForm';
import type {
    IBuildPolicyProposalActionsParams,
    IBuildTransactionParams,
    IPreparePolicyMetadata,
} from './preparePolicyDialogUtils.api';

class PreparePolicyDialogUtils {
    private publishPolicyProposalMetadata = {
        title: 'Deploy Capital Flow Policy',
        summary: 'This proposal deploys a new capital flow policy to the DAO',
    };

    preparePolicyMetadata = (values: ICreatePolicyFormData) => {
        const { name, description, policyKey, resources } = values;

        return {
            name,
            description,
            policyKey,
            resources,
        };
    };

    buildPreparePolicyTransaction = async (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, policyMetadata, dao } = params;

        // TODO: Implement the actual transaction building logic
        // This should:
        // 1. Deploy the strategy contract (router/distributor/defi adapter)
        // 2. Configure the strategy with the provided settings
        // 3. Register the policy with the DAO

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
}

export const preparePolicyDialogUtils = new PreparePolicyDialogUtils();
