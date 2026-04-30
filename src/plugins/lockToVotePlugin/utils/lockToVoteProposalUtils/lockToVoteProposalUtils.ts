import type { ProposalStatus } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import { bigIntUtils } from '@/shared/utils/bigIntUtils';
import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import {
    type ITokenProposalOptionVotes,
    VoteOption,
} from '../../../tokenPlugin/types';
import type { ILockToVoteProposal } from '../../types';

class LockToVoteProposalUtils {
    getProposalStatus = (proposal: ILockToVoteProposal): ProposalStatus => {
        const { startDate, endDate, hasActions, executed } = proposal;

        const approvalReached = this.isApprovalReached(proposal);
        const status = proposalStatusUtils.getProposalStatus({
            isExecuted: executed.status,
            isVetoed: false,
            startDate,
            endDate,
            paramsMet: approvalReached,
            hasActions,
            canExecuteEarly: false, // LockToVote does not support early execution
        });

        return status;
    };

    isApprovalReached = (proposal: ILockToVoteProposal): boolean => {
        const isMinParticipationReached =
            this.isMinParticipationReached(proposal);
        const isSupportReached = this.isSupportReached(proposal);

        return isMinParticipationReached && isSupportReached;
    };

    hasSucceeded = (proposal: ILockToVoteProposal) => {
        const { executed, endDate } = proposal;
        const hasEnded = proposalStatusUtils.hasEnded({
            isExecuted: executed.status,
            endDate,
        });

        if (!hasEnded) {
            return false;
        }

        const isApprovalReached = this.isApprovalReached(proposal);

        return isApprovalReached;
    };

    isMinParticipationReached = (proposal: ILockToVoteProposal): boolean => {
        const { minParticipation } = proposal.settings;

        const parsedMinParticipation = bigIntUtils.safeParse(minParticipation);
        const parsedTotalSupply = bigIntUtils.safeParse(
            this.getProposalTokenTotalSupply(proposal),
        );

        if (parsedTotalSupply === BigInt(0)) {
            return false;
        }

        const totalVotes = this.getTotalVotes(proposal);
        const minVotingPower =
            (parsedTotalSupply * parsedMinParticipation) /
            BigInt(tokenSettingsUtils.percentageToRatio(100));

        return totalVotes >= minVotingPower;
    };

    isSupportReached = (proposal: ILockToVoteProposal): boolean => {
        const { supportThreshold } = proposal.settings;
        const { votesByOption } = proposal.metrics;

        const yesVotes = this.getVoteByType(votesByOption, VoteOption.YES);
        const noVotesCurrent = this.getVoteByType(votesByOption, VoteOption.NO);

        // Keeps mental model more closely aligned with token plugin implementation
        const noVotesComparator = noVotesCurrent;

        return (
            (tokenSettingsUtils.ratioBase -
                bigIntUtils.safeParse(supportThreshold)) *
                yesVotes >
            bigIntUtils.safeParse(supportThreshold) * noVotesComparator
        );
    };

    getTotalVotes = (
        proposal: ILockToVoteProposal,
        excludeAbstain?: boolean,
    ): bigint => {
        const { votesByOption } = proposal.metrics;

        const totalVotes = votesByOption.reduce((accumulator, current) => {
            if (excludeAbstain && current.type === VoteOption.ABSTAIN) {
                return accumulator;
            }

            return (
                accumulator + bigIntUtils.safeParse(current.totalVotingPower)
            );
        }, BigInt(0));

        return totalVotes;
    };

    getVoteByType = (
        votes: ITokenProposalOptionVotes[],
        type: VoteOption,
    ): bigint => {
        const optionVotes = votes.find((option) => option.type === type);

        return bigIntUtils.safeParse(optionVotes?.totalVotingPower);
    };

    getOptionVotingPower = (
        proposal: ILockToVoteProposal,
        option: VoteOption,
    ) => {
        const votes = proposal.metrics.votesByOption.find(
            (vote) => vote.type === option,
        );
        const parsedVotingPower = formatUnits(
            bigIntUtils.safeParse(votes?.totalVotingPower),
            proposal.settings.token.decimals,
        );

        return parsedVotingPower;
    };

    getProposalTokenTotalSupply = (
        proposal: ILockToVoteProposal,
    ): string | undefined => {
        return proposal.settings.historicalTotalSupply;
    };
}

export const lockToVoteProposalUtils = new LockToVoteProposalUtils();
