import dynamic from 'next/dynamic';

export const LockToVoteLockUnlockDialog = dynamic(() =>
    import('./lockToVoteLockUnlockDialog').then((mod) => mod.LockToVoteLockUnlockDialog),
);

export type { ILockToVoteLockUnlockDialogParams, ILockToVoteLockUnlockDialogProps } from './lockToVoteLockUnlockDialog';
