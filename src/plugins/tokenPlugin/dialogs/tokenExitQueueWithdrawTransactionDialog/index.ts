import dynamic from 'next/dynamic';

export const TokenExitQueueWithdrawTransactionDialog = dynamic(() =>
    import('./tokenExitQueueWithdrawTransactionDialog').then((mod) => mod.TokenExitQueueWithdrawTransactionDialog)
);

export type {
    ITokenExitQueueWithdrawTransactionDialogParams,
    ITokenExitQueueWithdrawTransactionDialogProps,
} from './tokenExitQueueWithdrawTransactionDialog.api';
