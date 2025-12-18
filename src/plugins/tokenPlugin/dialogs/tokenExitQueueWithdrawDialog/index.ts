import dynamic from 'next/dynamic';

export const TokenExitQueueWithdrawDialog = dynamic(() =>
    import('./tokenExitQueueWithdrawDialog').then((mod) => mod.TokenExitQueueWithdrawDialog)
);

export type {
    ITokenExitQueueWithdrawDialogParams,
    ITokenExitQueueWithdrawDialogProps,
} from './tokenExitQueueWithdrawDialog.api';
