import { encodeFunctionData, type Hex } from 'viem';
import type {
    IBuildVoteDataOption,
    IBuildVoteDataParams,
} from '@/modules/governance/types';
import { tokenTransactionUtils } from '@/plugins/tokenPlugin/utils/tokenTransactionUtils';
import { alchemixTokenVotingAbi } from '../../constants';

export type AlchemixVoteType = 'override' | 'voteAndOverride';

export interface IAlchemixVoteOption extends IBuildVoteDataOption {
    /**
     * Casts the vote as an override of the delegate's vote (override) or as an atomic combination of a normal vote
     * and an override (voteAndOverride). Defaults to a normal vote.
     */
    voteType?: AlchemixVoteType;
}

class AlchemixTransactionUtils {
    buildVoteData = (
        params: IBuildVoteDataParams<number, IAlchemixVoteOption>,
    ): Hex => {
        const { proposalIndex, vote } = params;

        if (vote.voteType == null) {
            return tokenTransactionUtils.buildVoteData(params);
        }

        const functionName =
            vote.voteType === 'override' ? 'overrideVote' : 'voteAndOverride';

        const data = encodeFunctionData({
            abi: alchemixTokenVotingAbi,
            functionName,
            args: [BigInt(proposalIndex), vote.value],
        });

        return data;
    };
}

export const alchemixTransactionUtils = new AlchemixTransactionUtils();
