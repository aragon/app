import dynamic from 'next/dynamic';

export const LockToVoteProposalVotingSummary = dynamic(() =>
    import('./lockToVoteProposalVotingSummary').then((mod) => mod.LockToVoteProposalVotingSummary)
);

export type { ILockToVoteProposalVotingSummaryProps } from './lockToVoteProposalVotingSummary';
