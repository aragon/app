import { ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { formatUnits } from 'viem';
import { DaoTokenVotingMode, VoteOption, type ITokenProposal, type ITokenProposalOptionVotes } from '../../types';
import { tokenSettingsUtils } from '../tokenSettingsUtils';

class TokenProposalUtils {
    getProposalStatus = (proposal: ITokenProposal): ProposalStatus => {
        const now = DateTime.utc();

        const startDate = DateTime.fromMillis(proposal.startDate * 1000);
        const endDate = DateTime.fromMillis(proposal.endDate * 1000);

        const approvalReached = this.isApprovalReached(proposal);
        const approvalReachedEarly = this.isApprovalReached(proposal, true);

        const isSignalingProposal = proposal.actions.length === 0;
        const isEarlyExecution = proposal.settings.votingMode === DaoTokenVotingMode.EARLY_EXECUTION;

        const isExecutable =
            ((approvalReached && now >= endDate) || (isEarlyExecution && approvalReachedEarly)) && !isSignalingProposal;

        if (proposal.executed.status) {
            return ProposalStatus.EXECUTED;
        }

        if (startDate >= now) {
            return ProposalStatus.PENDING;
        }

        if (isExecutable) {
            return ProposalStatus.EXECUTABLE;
        }

        if (now < endDate) {
            return ProposalStatus.ACTIVE;
        }

        return approvalReached && isSignalingProposal ? ProposalStatus.ACCEPTED : ProposalStatus.REJECTED;
    };

    getWinningOption = (proposal: ITokenProposal): VoteOption | undefined => {
        const { votesByOption } = proposal.metrics;

        if (!votesByOption.length) {
            return undefined;
        }

        const abstainVotes = tokenProposalUtils.getVoteByType(votesByOption, VoteOption.ABSTAIN);
        const noVotes = tokenProposalUtils.getVoteByType(votesByOption, VoteOption.NO);

        const winningOption = tokenProposalUtils.isSupportReached(proposal)
            ? VoteOption.YES
            : abstainVotes > noVotes
              ? VoteOption.ABSTAIN
              : VoteOption.NO;

        return winningOption;
    };

    isApprovalReached = (proposal: ITokenProposal, early?: boolean): boolean => {
        const isMinParticipationReached = this.isMinParticipationReached(proposal);
        const isSupportReached = this.isSupportReached(proposal, early);

        return isMinParticipationReached && isSupportReached;
    };

    hasSucceeded = (proposal: ITokenProposal) => {
        const isApprovalReached = this.isApprovalReached(proposal);
        const isApprovalReachedEarly = this.isApprovalReached(proposal, true);

        const now = DateTime.utc();
        const startDate = DateTime.fromMillis(proposal.startDate * 1000);
        const endDate = DateTime.fromMillis(proposal.endDate * 1000);

        const isProposalOpen = now > startDate && now < endDate;

        if (isProposalOpen) {
            return proposal.settings.votingMode === DaoTokenVotingMode.EARLY_EXECUTION && isApprovalReachedEarly;
        }

        return isApprovalReached;
    };

    isMinParticipationReached = (proposal: ITokenProposal): boolean => {
        const { minParticipation, historicalTotalSupply } = proposal.settings;

        const parsedTotalSupply = BigInt(historicalTotalSupply!);
        const parsedMinParticipation = BigInt(tokenSettingsUtils.fromRatioToPercentage(minParticipation));

        if (parsedTotalSupply === BigInt(0)) {
            return false;
        }

        const totalVotes = this.getTotalVotes(proposal);
        const minVotingPower = (parsedTotalSupply * parsedMinParticipation) / BigInt(100);

        return totalVotes >= minVotingPower;
    };

    isSupportReached = (proposal: ITokenProposal, early?: boolean): boolean => {
        const { supportThreshold, historicalTotalSupply } = proposal.settings;
        const { votesByOption } = proposal.metrics;

        const parsedSupport = BigInt(tokenSettingsUtils.fromRatioToPercentage(supportThreshold));

        const yesVotes = this.getVoteByType(votesByOption, VoteOption.YES);
        const abstainVotes = this.getVoteByType(votesByOption, VoteOption.ABSTAIN);

        const noVotesCurrent = this.getVoteByType(votesByOption, VoteOption.NO);
        const noVotesWorstCase = BigInt(historicalTotalSupply!) - yesVotes - abstainVotes;

        // For early-execution, check that the support threshold is met even if all remaining votes are no votes.
        const noVotesComparator = early ? noVotesWorstCase : noVotesCurrent;

        return (BigInt(100) - parsedSupport) * yesVotes > parsedSupport * noVotesComparator;
    };

    getTotalVotes = (proposal: ITokenProposal, excludeAbstain?: boolean): bigint => {
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

    getOptionVotingPower = (proposal: ITokenProposal, option: VoteOption) => {
        const votes = proposal.metrics.votesByOption.find((vote) => vote.type === option);
        const parsedVotingPower = formatUnits(BigInt(votes?.totalVotingPower ?? 0), proposal.settings.token.decimals);

        return parsedVotingPower;
    };
}

export const tokenProposalUtils = new TokenProposalUtils();
