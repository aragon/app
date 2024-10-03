import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type Hex } from 'viem';
import { IProposal } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { type IBuildVoteDataParams } from '../../types';

export interface IBuildTransactionParams {
    /**
     * Proposal to submit the vote for.
     */
    proposal: IProposal;
    /**
     * Vote option selected by the user.
     */
    voteValue?: number;
}

class VoteDialogUtils {
    buildTransaction = (params: IBuildTransactionParams) => {
        const { proposal, voteValue } = params;

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildVoteDataParams, Hex>({
            pluginId: proposal.pluginSubdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
        })!;

        const buildDataParams: IBuildVoteDataParams = { proposalIndex: proposal.proposalIndex, vote: voteValue };
        const transactionData = buildDataFunction(buildDataParams);

        const transaction: TransactionDialogPrepareReturn = {
            to: proposal.pluginAddress as Hex,
            data: transactionData,
        };

        return Promise.resolve(transaction);
    };
}

export const voteDialogUtils = new VoteDialogUtils();
