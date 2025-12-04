import dynamic from 'next/dynamic';

export const GaugeVoterSelectGaugeDialog = dynamic(() =>
    import('./gaugeVoterSelectGaugeDialog').then((mod) => mod.GaugeVoterSelectGaugeDialog),
);

export type { IGaugeVoterSelectGaugeDialogParams } from './gaugeVoterSelectGaugeDialog';
