import { encodeFunctionData, type Hex } from 'viem';
import type {
    IBuildVoteDataOption,
    IBuildVoteDataParams,
} from '@/modules/governance/types';
import { alchemixTokenVotingAbi } from '../../constants';

export type AlchemixVoteType = 'override' | 'voteAndOverride';

export interface IAlchemixVoteOption extends IBuildVoteDataOption {
    /**
     * Casts the vote as an override of the delegate's vote (override) or as an atomic combination of a normal vote
     * and an override (voteAndOverride). When unset, the vote is not handled here and falls back to the
     * build-vote-data function of the plugin the proposal belongs to.
     */
    voteType?: AlchemixVoteType;
}

class AlchemixTransactionUtils {
    buildVoteData = (
        params: IBuildVoteDataParams<number, IAlchemixVoteOption>,
    ): Hex | undefined => {
        const { proposalIndex, vote } = params;

        // Only handle Alchemix-specific override votes so that normal votes — for Token Voting or any other body
        // installed on the DAO — fall back to the build-vote-data function of the proposal plugin.
        if (vote.voteType == null) {
            return undefined;
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
