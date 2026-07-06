import dynamic from 'next/dynamic';

export const GaugeVoterExitQueueWithdrawDialog = dynamic(() =>
    import('./gaugeVoterExitQueueWithdrawDialog').then(
        (mod) => mod.GaugeVoterExitQueueWithdrawDialog,
    ),
);

export type {
    IGaugeVoterExitQueueWithdrawDialogParams,
    IGaugeVoterExitQueueWithdrawDialogProps,
} from './gaugeVoterExitQueueWithdrawDialog.api';
