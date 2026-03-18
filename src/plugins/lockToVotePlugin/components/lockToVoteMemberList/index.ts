import dynamic from 'next/dynamic';

export const LockToVoteMemberList = dynamic(() =>
    import('./lockToVoteMemberList').then((m) => m.LockToVoteMemberList),
);
export type { ILockToVoteMemberListProps } from './lockToVoteMemberList';
