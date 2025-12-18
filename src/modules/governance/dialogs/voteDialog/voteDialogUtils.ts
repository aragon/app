import type { Hex } from 'viem';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { IProposal } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IBuildVoteDataOption, IBuildVoteDataParams } from '../../types';

export interface IBuildTransactionParams {
    /**
     * Proposal to submit the vote for.
     */
    proposal: IProposal;
    /**
     * Vote option selected by the user.
     */
    vote: IBuildVoteDataOption;
    /**
     * Target of the transaction, defaults to the plugin address of the proposal.
     */
    target?: string;
}

class VoteDialogUtils {
    buildTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { proposal, vote, target } = params;

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildVoteDataParams, Hex>({
            pluginId: proposal.pluginInterfaceType,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
        })!;

        const transactionData = buildDataFunction({ proposalIndex: proposal.proposalIndex, vote });
        const transactionTarget = (target ?? proposal.pluginAddress) as Hex;

        const transaction = { to: transactionTarget, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const voteDialogUtils = new VoteDialogUtils();
