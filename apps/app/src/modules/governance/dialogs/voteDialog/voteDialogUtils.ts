import type { Hex } from 'viem';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { IProposal } from '../../api/governanceService';
import { GovernanceDaoSlotId } from '../../constants/moduleDaoSlots';
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
    /**
     * ID of the DAO the vote is submitted for. Used to resolve a DAO-specific build-vote-data function taking
     * precedence over the plugin one. The DAO function may return undefined for votes it does not handle, in which
     * case the plugin function is used.
     */
    daoId?: string;
}

class VoteDialogUtils {
    buildTransaction = (
        params: IBuildTransactionParams,
    ): Promise<ITransactionRequest> => {
        const { proposal, vote, target, daoId } = params;

        const buildDataParams = {
            proposalIndex: proposal.proposalIndex,
            vote,
        };

        const daoBuildDataFunction =
            daoId != null
                ? pluginRegistryUtils.getSlotFunction<
                      IBuildVoteDataParams,
                      Hex | undefined
                  >({
                      pluginId: daoId,
                      slotId: GovernanceDaoSlotId.GOVERNANCE_DAO_BUILD_VOTE_DATA,
                  })
                : undefined;

        const daoTransactionData = daoBuildDataFunction?.(buildDataParams);

        const transactionData =
            daoTransactionData ??
            pluginRegistryUtils.getSlotFunction<IBuildVoteDataParams, Hex>({
                pluginId: proposal.pluginInterfaceType,
                slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
            })!(buildDataParams);
        const transactionTarget = (target ?? proposal.pluginAddress) as Hex;

        const transaction = {
            to: transactionTarget,
            data: transactionData,
            value: BigInt(0),
        };

        return Promise.resolve(transaction);
    };
}

export const voteDialogUtils = new VoteDialogUtils();
