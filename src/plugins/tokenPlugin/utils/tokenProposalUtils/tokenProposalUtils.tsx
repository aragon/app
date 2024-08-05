import { type ProposalStatus } from '@aragon/ods';
import { DateTime } from 'luxon';
import { DaoTokenVotingMode, VoteOption, type ITokenProposal } from '../../types';
import { tokenSettingsUtils } from '../tokenSettingsUtils';

class TokenProposalUtils {
    getProposalStatus = (proposal: ITokenProposal): ProposalStatus => {
        const now = DateTime.utc();

        const startDate = DateTime.fromMillis(proposal.startDate * 1000);
        const endDate = DateTime.fromMillis(proposal.endDate * 1000);

        const approvalReached = this.isApprovalReached(proposal);
        const isSignalingProposal = proposal.actions.length === 0;

        const isEarlyExecution = proposal.settings.votingMode === DaoTokenVotingMode.EARLY_EXECUTION;
        const isExecutable = approvalReached && (now >= endDate || isEarlyExecution);

        if (proposal.executed.status === true) {
            return 'executed';
        }

        if (startDate >= now) {
            return 'pending';
        }

        if (isExecutable && !isSignalingProposal) {
            return 'queued';
        }

        if (now < endDate) {
            return 'active';
        }

        if (approvalReached && isSignalingProposal) {
            return 'accepted';
        }

        return 'rejected';
    };

    isApprovalReached = (proposal: ITokenProposal): boolean => {
        const { minParticipation, supportThreshold } = proposal.settings;
        const { totalSupply } = proposal.token;

        const totalVotes = proposal.metrics.votesByOption.reduce(
            (accumulator, current) =>
                accumulator + BigInt(tokenSettingsUtils.fromScientificNotation(current.totalVotingPower)),
            BigInt(0),
        );
        const totalVotesPercentage = (totalVotes * BigInt(100)) / BigInt(totalSupply);
        const isMinParticipationReached =
            totalVotesPercentage > tokenSettingsUtils.parsePercentageSetting(minParticipation);

        const yesVotes = proposal.metrics.votesByOption.find((optionVotes) => optionVotes.type === VoteOption.YES);
        const yesVotesPercentage = totalVotes
            ? (BigInt(tokenSettingsUtils.fromScientificNotation(yesVotes?.totalVotingPower)) * BigInt(100)) / totalVotes
            : 0;
        const isSupportThresholdReached =
            yesVotesPercentage > tokenSettingsUtils.parsePercentageSetting(supportThreshold);

        return isMinParticipationReached && isSupportThresholdReached;
    };
}

export const tokenProposalUtils = new TokenProposalUtils();
