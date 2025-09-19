import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import { type ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { formatUnits } from 'viem';
import { DaoTokenVotingMode, VoteOption, type ITokenProposal, type ITokenProposalOptionVotes } from '../../types';
import { tokenSettingsUtils } from '../tokenSettingsUtils';

class TokenProposalUtils {
    getProposalStatus = (proposal: ITokenProposal): ProposalStatus => {
        const { startDate, endDate, hasActions, executed } = proposal;

        const endsInTheFuture = proposalStatusUtils.endsInTheFuture(endDate);
        const approvalReached = this.isApprovalReached(proposal);
        const approvalReachedEarly = this.isApprovalReached(proposal, true);

        const isEarlyExecution = proposal.settings.votingMode === DaoTokenVotingMode.EARLY_EXECUTION;
        const paramsMet = isEarlyExecution && endsInTheFuture ? approvalReachedEarly : approvalReached;

        const status = proposalStatusUtils.getProposalStatus({
            isExecuted: executed.status,
            isVetoed: false,
            startDate,
            endDate,
            paramsMet,
            hasActions,
            canExecuteEarly: isEarlyExecution,
        });

        return status;
    };

    isApprovalReached = (proposal: ITokenProposal, early?: boolean): boolean => {
        const isMinParticipationReached = this.isMinParticipationReached(proposal);
        const isSupportReached = this.isSupportReached(proposal, early);

        return isMinParticipationReached && isSupportReached;
    };

    hasSucceeded = (proposal: ITokenProposal) => {
        const isApprovalReached = this.isApprovalReached(proposal);

        const now = DateTime.utc();
        const startDate = DateTime.fromMillis(proposal.startDate * 1000);
        const endDate = DateTime.fromMillis(proposal.endDate * 1000);

        const isProposalOpen = now > startDate && now < endDate;

        if (isProposalOpen) {
            const isApprovalReachedEarly = this.isApprovalReached(proposal, true);

            return proposal.settings.votingMode !== DaoTokenVotingMode.VOTE_REPLACEMENT && isApprovalReachedEarly;
        }

        return isApprovalReached;
    };

    isMinParticipationReached = (proposal: ITokenProposal): boolean => {
        const { minParticipation, historicalTotalSupply } = proposal.settings;

        // Don't do the ratio-to-percentage conversion here as the minParticipation can be a value with decimals and
        // the BigInt contructor does not support such values.
        const parsedMinParticipation = BigInt(minParticipation);
        const parsedTotalSupply = BigInt(historicalTotalSupply!);

        if (parsedTotalSupply === BigInt(0)) {
            return false;
        }

        const totalVotes = this.getTotalVotes(proposal);
        const minVotingPower =
            (parsedTotalSupply * parsedMinParticipation) / BigInt(tokenSettingsUtils.percentageToRatio(100));

        return totalVotes >= minVotingPower;
    };

    isSupportReached = (proposal: ITokenProposal, early?: boolean): boolean => {
        const { supportThreshold, historicalTotalSupply } = proposal.settings;
        const { votesByOption } = proposal.metrics;

        const parsedSupport = BigInt(supportThreshold);

        const yesVotes = this.getVoteByType(votesByOption, VoteOption.YES);
        const abstainVotes = this.getVoteByType(votesByOption, VoteOption.ABSTAIN);

        const noVotesCurrent = this.getVoteByType(votesByOption, VoteOption.NO);
        const noVotesWorstCase = BigInt(historicalTotalSupply ?? 0) - yesVotes - abstainVotes;
        const noVotesComparator = early ? noVotesWorstCase : noVotesCurrent;

        return (tokenSettingsUtils.ratioBase - parsedSupport) * yesVotes > parsedSupport * noVotesComparator;
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
