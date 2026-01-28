import dynamic from 'next/dynamic';

export const GaugeVoterExitQueueWithdrawTransactionDialog = dynamic(() =>
    import('./gaugeVoterExitQueueWithdrawTransactionDialog').then(
        (mod) => mod.GaugeVoterExitQueueWithdrawTransactionDialog,
    ),
);

export type {
    IGaugeVoterExitQueueWithdrawTransactionDialogParams,
    IGaugeVoterExitQueueWithdrawTransactionDialogProps,
} from './gaugeVoterExitQueueWithdrawTransactionDialog.api';
