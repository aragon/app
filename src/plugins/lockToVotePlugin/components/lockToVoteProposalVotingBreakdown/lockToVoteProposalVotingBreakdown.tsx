'use client';

import { ProposalVoting } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { formatUnits } from 'viem';
import { VoteOption } from '../../../tokenPlugin/types';
import { tokenSettingsUtils } from '../../../tokenPlugin/utils/tokenSettingsUtils';
import type { ILockToVoteProposal } from '../../types';
import { lockToVoteProposalUtils } from '../../utils/lockToVoteProposalUtils';

export interface ILockToVoteProposalVotingBreakdownProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal: ILockToVoteProposal;
    /**
     * Defines if the voting is to veto or not.
     */
    isVeto?: boolean;
    /**
     * Additional children to render.
     */
    children?: ReactNode;
}

export const LockToVoteProposalVotingBreakdown: React.FC<ILockToVoteProposalVotingBreakdownProps> = (props) => {
    const { proposal, children, isVeto } = props;

    const { symbol, decimals } = proposal.settings.token;
    const { minParticipation, supportThreshold } = proposal.settings;

    const totalSupply = lockToVoteProposalUtils.getProposalTokenTotalSupply(proposal);
    const yesVotes = lockToVoteProposalUtils.getOptionVotingPower(proposal, VoteOption.YES);
    const noVotes = lockToVoteProposalUtils.getOptionVotingPower(proposal, VoteOption.NO);
    const abstainVotes = lockToVoteProposalUtils.getOptionVotingPower(proposal, VoteOption.ABSTAIN);

    return (
        <ProposalVoting.BreakdownToken
            isVeto={isVeto}
            totalYes={yesVotes}
            totalNo={noVotes}
            totalAbstain={abstainVotes}
            minParticipation={tokenSettingsUtils.ratioToPercentage(minParticipation)}
            supportThreshold={tokenSettingsUtils.ratioToPercentage(supportThreshold)}
            tokenSymbol={symbol}
            tokenTotalSupply={formatUnits(BigInt(totalSupply ?? 0), decimals)}
        >
            {children}
        </ProposalVoting.BreakdownToken>
    );
};
