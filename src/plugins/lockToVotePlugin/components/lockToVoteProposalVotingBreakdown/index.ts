import dynamic from 'next/dynamic';

export const LockToVoteProposalVotingBreakdown = dynamic(() =>
    import('./lockToVoteProposalVotingBreakdown').then((mod) => mod.LockToVoteProposalVotingBreakdown),
);
export type { ILockToVoteProposalVotingBreakdownProps } from './lockToVoteProposalVotingBreakdown';
