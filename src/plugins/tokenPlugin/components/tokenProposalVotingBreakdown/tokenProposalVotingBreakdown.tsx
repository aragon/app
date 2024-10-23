import { ProposalVoting } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { ITokenProposal } from '../../types';
import { VoteOption } from '../../types/enum/voteOption';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

export interface ITokenProposalVotingBreakdownProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal: ITokenProposal;
}

const getOptionVotingPower = (proposal: ITokenProposal, option: VoteOption) => {
    const votes = proposal.metrics.votesByOption.find((vote) => vote.type === option);
    const parsedVotingPower = formatUnits(BigInt(votes?.totalVotingPower ?? 0), proposal.settings.token.decimals);

    return parsedVotingPower;
};

export const TokenProposalVotingBreakdown: React.FC<ITokenProposalVotingBreakdownProps> = (props) => {
    const { proposal } = props;

    const { symbol, decimals } = proposal.settings.token;
    const { minParticipation, supportThreshold, historicalTotalSupply } = proposal.settings;

    const yesVotes = getOptionVotingPower(proposal, VoteOption.YES);
    const noVotes = getOptionVotingPower(proposal, VoteOption.NO);
    const abstainVotes = getOptionVotingPower(proposal, VoteOption.ABSTAIN);

    return (
        <ProposalVoting.BreakdownToken
            totalYes={yesVotes}
            totalNo={noVotes}
            totalAbstain={abstainVotes}
            minParticipation={tokenSettingsUtils.parsePercentageSetting(minParticipation)}
            supportThreshold={tokenSettingsUtils.parsePercentageSetting(supportThreshold)}
            tokenSymbol={symbol}
            tokenTotalSupply={formatUnits(BigInt(historicalTotalSupply!), decimals)}
        />
    );
};
