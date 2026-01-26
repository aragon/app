import dynamic from 'next/dynamic';

export const GaugeVoterLocksDialog = dynamic(() =>
    import('./gaugeVoterLocksDialog').then((mod) => mod.GaugeVoterLocksDialog),
);
export type {
    IGaugeVoterLocksDialogParams,
    IGaugeVoterLocksDialogProps,
} from './gaugeVoterLocksDialog';
