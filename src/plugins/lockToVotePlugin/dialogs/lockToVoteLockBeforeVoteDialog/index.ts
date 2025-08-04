import dynamic from 'next/dynamic';

export const LockToVoteLockBeforeVoteDialog = dynamic(() =>
    import('./lockToVoteLockBeforeVoteDialog').then((mod) => mod.LockToVoteLockBeforeVoteDialog),
);

export type {
    ILockToVoteLockBeforeVoteDialogParams,
    ILockToVoteLockBeforeVoteDialogProps,
} from './lockToVoteLockBeforeVoteDialog';
