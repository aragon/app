import dynamic from 'next/dynamic';

export const GaugeRegistrarSelectGaugeDialog = dynamic(() =>
    import('./gaugeRegistrarSelectGaugeDialog').then(
        (mod) => mod.GaugeRegistrarSelectGaugeDialog,
    ),
);

export type { IGaugeRegistrarSelectGaugeDialogParams } from './gaugeRegistrarSelectGaugeDialog';
