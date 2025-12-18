import dynamic from 'next/dynamic';

export const LockToVoteProcessBodyField = dynamic(() =>
    import('./lockToVoteProcessBodyField').then((mod) => mod.LockToVoteProcessBodyField)
);

export type { ILockToVoteProcessBodyFieldProps } from './lockToVoteProcessBodyField';
