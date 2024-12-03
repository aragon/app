import { formatUnits } from 'viem';
import type { ITokenProposal, VoteOption } from '../../types';

class TokenVotingUtils {
    getOptionVotingPower = (proposal: ITokenProposal, option: VoteOption) => {
        const votes = proposal.metrics.votesByOption.find((vote) => vote.type === option);
        const parsedVotingPower = formatUnits(BigInt(votes?.totalVotingPower ?? 0), proposal.settings.token.decimals);

        return parsedVotingPower;
    };
}

export const tokenVotingUtils = new TokenVotingUtils();
