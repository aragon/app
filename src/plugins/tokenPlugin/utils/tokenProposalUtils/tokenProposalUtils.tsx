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
        const isExecutable = approvalReached && (now >= endDate || isEarlyExecution) && !isSignalingProposal;

        if (proposal.executed.status === true) {
            return 'executed';
        }

        if (startDate >= now) {
            return 'pending';
        }

        if (isExecutable) {
            // TODO: remove cast when https://github.com/aragon/ods/pull/267 is merged on ODS
            return 'executable' as ProposalStatus;
        }

        if (now < endDate) {
            return 'active';
        }

        return approvalReached && isSignalingProposal ? 'accepted' : 'rejected';
    };

    isApprovalReached = (proposal: ITokenProposal): boolean => {
        const isMinParticipationReached = this.isMinParticipationReached(proposal);
        const isSupportReached = this.isSupportReached(proposal);

        return isMinParticipationReached && isSupportReached;
    };

    isMinParticipationReached = (proposal: ITokenProposal): boolean => {
        const { minParticipation } = proposal.settings;
        const { totalSupply } = proposal.token;

        const parsedTotalSupply = BigInt(totalSupply);

        if (parsedTotalSupply === BigInt(0)) {
            return false;
        }

        const totalVotes = this.getTotalVotes(proposal);
        const totalVotesPercentage = (totalVotes * BigInt(100)) / parsedTotalSupply;

        return totalVotesPercentage >= tokenSettingsUtils.parsePercentageSetting(minParticipation);
    };

    isSupportReached = (proposal: ITokenProposal): boolean => {
        const { supportThreshold } = proposal.settings;
        const { votesByOption } = proposal.metrics;

        const totalVotes = this.getTotalVotes(proposal);

        if (totalVotes === BigInt(0)) {
            return false;
        }

        const yesVotes = votesByOption.find((optionVotes) => optionVotes.type === VoteOption.YES);
        const parsedYesVotes = BigInt(tokenSettingsUtils.fromScientificNotation(yesVotes?.totalVotingPower));
        const yesVotesPercentage = (parsedYesVotes * BigInt(100)) / totalVotes;

        return yesVotesPercentage >= tokenSettingsUtils.parsePercentageSetting(supportThreshold);
    };

    getTotalVotes = (proposal: ITokenProposal): bigint => {
        const { votesByOption } = proposal.metrics;

        const totalVotes = votesByOption.reduce(
            (accumulator, current) =>
                accumulator + BigInt(tokenSettingsUtils.fromScientificNotation(current.totalVotingPower)),
            BigInt(0),
        );

        return totalVotes;
    };
}

export const tokenProposalUtils = new TokenProposalUtils();
