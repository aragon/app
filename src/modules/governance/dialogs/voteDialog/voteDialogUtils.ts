import { type IDaoPlugin } from '@/shared/api/daoService';
import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type Hex } from 'viem';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { type IBuildVoteDataParams } from '../../types';

export interface IBuildTransactionParams {
    /**
     * Incremental ID for the proposal.
     */
    proposalId: string;
    /**
     * Vote option selected by the user.
     */
    vote: { value?: number; label: string };
    /**
     * Plugin of the DAO to interact with.
     */
    plugin: IDaoPlugin;
}

class VoteDialogUtils {
    buildTransaction = (params: IBuildTransactionParams) => {
        const { proposalId, vote, plugin } = params;

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildVoteDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
        })!;

        const buildDataParams: IBuildVoteDataParams = { proposalId, vote: vote.value };

        const transactionData = buildDataFunction(buildDataParams);

        const transaction: TransactionDialogPrepareReturn = {
            to: plugin.address as Hex,
            data: transactionData,
        };

        return Promise.resolve(transaction);
    };
}

export const voteDialogUtils = new VoteDialogUtils();
