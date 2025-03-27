import { ProposalVoting } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { formatUnits } from 'viem';
import type { ITokenProposal } from '../../types';
import { VoteOption } from '../../types/enum/voteOption';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

export interface ITokenProposalVotingBreakdownProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal: ITokenProposal;
    /**
     * Additional children to render.
     */
    children?: ReactNode;
}

export const TokenProposalVotingBreakdown: React.FC<ITokenProposalVotingBreakdownProps> = (props) => {
    const { proposal, children } = props;

    const { symbol, decimals } = proposal.settings.token;
    const { minParticipation, supportThreshold, historicalTotalSupply } = proposal.settings;

    const yesVotes = tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.YES);
    const noVotes = tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.NO);
    const abstainVotes = tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.ABSTAIN);

    return (
        <ProposalVoting.BreakdownToken
            totalYes={yesVotes}
            totalNo={noVotes}
            totalAbstain={abstainVotes}
            minParticipation={tokenSettingsUtils.ratioToPercentage(minParticipation)}
            supportThreshold={tokenSettingsUtils.ratioToPercentage(supportThreshold)}
            tokenSymbol={symbol}
            tokenTotalSupply={formatUnits(BigInt(historicalTotalSupply!), decimals)}
        >
            {children}
        </ProposalVoting.BreakdownToken>
    );
};
