'use client';

import { ProposalVoting, ProposalVotingTab, Tabs } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { formatUnits } from 'viem';
import { bigIntUtils } from '@/shared/utils/bigIntUtils';
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

export const LockToVoteProposalVotingBreakdown: React.FC<
    ILockToVoteProposalVotingBreakdownProps
> = (props) => {
    const { proposal, children, isVeto } = props;

    const { symbol, decimals } = proposal.settings.token;
    const { minParticipation, supportThreshold } = proposal.settings;

    const yesVotes = lockToVoteProposalUtils.getOptionVotingPower(
        proposal,
        VoteOption.YES,
    );
    const noVotes = lockToVoteProposalUtils.getOptionVotingPower(
        proposal,
        VoteOption.NO,
    );
    const abstainVotes = lockToVoteProposalUtils.getOptionVotingPower(
        proposal,
        VoteOption.ABSTAIN,
    );

    const totalSupply = bigIntUtils.safeParse(
        lockToVoteProposalUtils.getProposalTokenTotalSupply(proposal),
    );

    // The kit cannot measure participation against an unknown supply; keep the tab and the
    // vote submission it holds rather than failing the page.
    if (totalSupply <= BigInt(0)) {
        return (
            <Tabs.Content
                className="flex flex-col gap-4"
                value={ProposalVotingTab.BREAKDOWN}
            >
                {children}
            </Tabs.Content>
        );
    }

    const tokenTotalSupply = formatUnits(totalSupply, decimals);

    return (
        <ProposalVoting.BreakdownToken
            isVeto={isVeto}
            minParticipation={tokenSettingsUtils.ratioToPercentage(
                minParticipation,
            )}
            supportThreshold={tokenSettingsUtils.ratioToPercentage(
                supportThreshold,
            )}
            tokenSymbol={symbol}
            tokenTotalSupply={tokenTotalSupply}
            totalAbstain={abstainVotes}
            totalNo={noVotes}
            totalYes={yesVotes}
        >
            {children}
        </ProposalVoting.BreakdownToken>
    );
};
