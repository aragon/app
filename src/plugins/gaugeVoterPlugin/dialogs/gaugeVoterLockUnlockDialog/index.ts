import dynamic from 'next/dynamic';

export type {
    IGaugeVoterLockUnlockDialogParams,
    IGaugeVoterLockUnlockDialogProps,
} from './gaugeVoterLockUnlockDialog';

export const GaugeVoterLockUnlockDialog = dynamic(() =>
    import('./gaugeVoterLockUnlockDialog').then(
        (mod) => mod.GaugeVoterLockUnlockDialog,
    ),
);
