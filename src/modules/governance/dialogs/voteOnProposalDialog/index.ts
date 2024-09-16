import dynamic from 'next/dynamic';

export const VoteOnProposalDialog = dynamic(() =>
    import('./voteOnProposalDialog').then((mod) => mod.VoteOnProposalDialog),
);

export type { IVoteOnProposalDialogParams, IVoteOnProposalDialogProps } from './voteOnProposalDialog';
