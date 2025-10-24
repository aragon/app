import dynamic from 'next/dynamic';

export const LockToVoteWithdrawDialog = dynamic(() =>
    import('./lockToVoteWithdrawDialog').then((mod) => mod.LockToVoteWithdrawDialog),
);

export type { ILockToVoteWithdrawDialogParams, ILockToVoteWithdrawDialogProps } from './lockToVoteWithdrawDialog.api';
