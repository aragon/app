'use client';

import { ProposalVoting, ProposalVotingTab, Tabs } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { formatUnits } from 'viem';
import { bigIntUtils } from '@/shared/utils/bigIntUtils';
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
     * Defines if the voting is to veto or not.
     */
    isVeto?: boolean;
    /**
     * Additional children to render.
     */
    children?: ReactNode;
}

export const TokenProposalVotingBreakdown: React.FC<
    ITokenProposalVotingBreakdownProps
> = (props) => {
    const { proposal, children, isVeto } = props;

    const { symbol, decimals } = proposal.settings.token;
    const { minParticipation, supportThreshold, historicalTotalSupply } =
        proposal.settings;

    const yesVotes = tokenProposalUtils.getOptionVotingPower(
        proposal,
        VoteOption.YES,
    );
    const noVotes = tokenProposalUtils.getOptionVotingPower(
        proposal,
        VoteOption.NO,
    );
    const abstainVotes = tokenProposalUtils.getOptionVotingPower(
        proposal,
        VoteOption.ABSTAIN,
    );

    const totalSupply = bigIntUtils.safeParse(historicalTotalSupply);

    // The kit cannot measure participation without the supply snapshot the proposal status
    // is computed from; keep the tab and the vote submission it holds rather than failing
    // the page.
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
            tokenTotalSupply={formatUnits(totalSupply, decimals)}
            totalAbstain={abstainVotes}
            totalNo={noVotes}
            totalYes={yesVotes}
        >
            {children}
        </ProposalVoting.BreakdownToken>
    );
};
