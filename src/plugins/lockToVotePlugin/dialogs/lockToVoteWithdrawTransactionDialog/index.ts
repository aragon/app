import dynamic from 'next/dynamic';

export const LockToVoteWithdrawTransactionDialog = dynamic(() =>
    import('./lockToVoteWithdrawTransactionDialog').then((mod) => mod.LockToVoteWithdrawTransactionDialog),
);

export type {
    ILockToVoteWithdrawTransactionDialogParams,
    ILockToVoteWithdrawTransactionDialogProps,
} from './lockToVoteWithdrawTransactionDialog.api';
