import dynamic from 'next/dynamic';

export const LockToVoteSubmitVote = dynamic(() =>
    import('./lockToVoteSubmitVote').then((mod) => mod.LockToVoteSubmitVote),
);

export type { ILockToVoteSubmitVoteProps } from './lockToVoteSubmitVote';
