import dynamic from 'next/dynamic';

export const GaugeVoterGaugeDetailsDialog = dynamic(() =>
    import('./gaugeVoterGaugeDetailsDialog').then(
        (mod) => mod.GaugeVoterGaugeDetailsDialog,
    ),
);

export type {
    IGaugeVoterGaugeDetailsDialogParams,
    IGaugeVoterGaugeDetailsDialogProps,
} from './gaugeVoterGaugeDetailsDialog';
