import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import type { ProposalStatus } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { type ITokenProposalOptionVotes, VoteOption } from '../../../tokenPlugin/types';
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
        const isMinParticipationReached = this.isMinParticipationReached(proposal);
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

        // Don't do the ratio-to-percentage conversion here as the minParticipation can be a value with decimals and
        // the BigInt constructor does not support such values.
        const parsedMinParticipation = BigInt(minParticipation);
        const parsedTotalSupply = BigInt(this.getProposalTokenTotalSupply(proposal) ?? 0);

        if (parsedTotalSupply === BigInt(0)) {
            return false;
        }

        const totalVotes = this.getTotalVotes(proposal);
        const minVotingPower =
            (parsedTotalSupply * parsedMinParticipation) / BigInt(tokenSettingsUtils.percentageToRatio(100));

        return totalVotes >= minVotingPower;
    };

    isSupportReached = (proposal: ILockToVoteProposal): boolean => {
        const { supportThreshold } = proposal.settings;
        const { votesByOption } = proposal.metrics;

        const parsedSupport = BigInt(tokenSettingsUtils.ratioToPercentage(supportThreshold));
        const yesVotes = this.getVoteByType(votesByOption, VoteOption.YES);
        const noVotesCurrent = this.getVoteByType(votesByOption, VoteOption.NO);
        const noVotesComparator = noVotesCurrent;

        return (BigInt(100) - parsedSupport) * yesVotes > parsedSupport * noVotesComparator;
    };

    getTotalVotes = (proposal: ILockToVoteProposal, excludeAbstain?: boolean): bigint => {
        const { votesByOption } = proposal.metrics;

        const totalVotes = votesByOption.reduce((accumulator, current) => {
            if (excludeAbstain && current.type === VoteOption.ABSTAIN) {
                return accumulator;
            }

            return accumulator + BigInt(current.totalVotingPower);
        }, BigInt(0));

        return totalVotes;
    };

    getVoteByType = (votes: ITokenProposalOptionVotes[], type: VoteOption): bigint => {
        const optionVotes = votes.find((option) => option.type === type);

        return BigInt(optionVotes?.totalVotingPower ?? 0);
    };

    getOptionVotingPower = (proposal: ILockToVoteProposal, option: VoteOption) => {
        const votes = proposal.metrics.votesByOption.find((vote) => vote.type === option);
        const parsedVotingPower = formatUnits(BigInt(votes?.totalVotingPower ?? 0), proposal.settings.token.decimals);

        return parsedVotingPower;
    };

    getProposalTokenTotalSupply = (proposal: ILockToVoteProposal) => {
        const { historicalTotalSupply, token } = proposal.settings;
        // Fallback to the token total-supply as some plugins (e.g. lock-to-vote) do not use snapshot votes.
        const totalSupply = historicalTotalSupply ?? token.totalSupply;

        return totalSupply;
    };
}

export const lockToVoteProposalUtils = new LockToVoteProposalUtils();
