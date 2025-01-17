import type { IVote } from '@/modules/governance/api/governanceService';

class VoteListUtils {
    getProcessedProposalId = (vote: IVote) => {
        if (vote.parentProposal != null) {
            return vote.parentProposal.id;
        }
        return vote.proposal!.id;
    };

    getProcessedProposalLink = (vote: IVote, daoId: string) => {
        if (vote.parentProposal != null) {
            return `/dao/${daoId}/proposals/${vote.parentProposal.id}`;
        }
        return `/dao/${daoId}/proposals/${vote.proposal!.id}`;
    };

    getProcessedProposalTitle = (vote: IVote) => {
        if (vote.parentProposal != null) {
            return vote.parentProposal.title;
        }
        return vote.proposal!.title;
    };
}

export const voteListUtils = new VoteListUtils();
