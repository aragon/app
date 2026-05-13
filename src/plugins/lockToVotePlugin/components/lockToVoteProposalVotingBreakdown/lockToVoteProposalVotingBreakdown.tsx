'use client';

import {
    AlertInline,
    ProposalVoting,
    ProposalVotingTab,
    Spinner,
    Tabs,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { formatUnits, type Hex } from 'viem';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useTokenTotalSupply } from '@/shared/hooks/useTokenTotalSupply';
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

    const { chainId } = useDaoChain({ network: proposal.network });

    const {
        data: totalSupply,
        error,
        isLoading,
    } = useTokenTotalSupply({
        chainId: chainId as number,
        address: proposal.settings.token.address as Hex,
    });

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

    if (isLoading) {
        return <Spinner />;
    }

    if (error) {
        return (
            <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>
                <AlertInline message={error} variant="critical" />
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
            tokenTotalSupply={formatUnits(
                bigIntUtils.safeParse(totalSupply),
                decimals,
            )}
            totalAbstain={abstainVotes}
            totalNo={noVotes}
            totalYes={yesVotes}
        >
            {children}
        </ProposalVoting.BreakdownToken>
    );
};
