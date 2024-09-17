import { type IDaoPlugin } from '@/shared/api/daoService';
import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type Hex } from 'viem';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { type IBuildVoteDataParams } from '../../types';

export interface IBuildTransactionParams {
    /**
     * Values
     */
    values: { voteOption: string; proposalId: string };
    /**
     * Plugin of the DAO to interact with.
     */
    plugin: IDaoPlugin;
}

class VoteDialogUtils {
    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, plugin } = params;

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildVoteDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
        })!;

        const { voteOption, proposalId } = values;

        const buildDataParams: IBuildVoteDataParams = { proposalId, vote: Number(voteOption) };

        const transactionData = buildDataFunction(buildDataParams);

        const transaction: TransactionDialogPrepareReturn = {
            to: plugin.address as Hex,
            data: transactionData,
        };

        return Promise.resolve(transaction);
    };
}

export const voteDialogUtils = new VoteDialogUtils();
