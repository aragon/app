import dynamic from 'next/dynamic';

export const LockToVoteLockTokensDialog = dynamic(() =>
    import('./lockToVoteLockTokensDialog').then((mod) => mod.LockToVoteLockTokensDialog),
);

export type { ILockToVoteLockTokensDialogParams, ILockToVoteLockTokensDialogProps } from './lockToVoteLockTokensDialog';
