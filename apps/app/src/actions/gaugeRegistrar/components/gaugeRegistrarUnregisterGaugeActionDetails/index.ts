import dynamic from 'next/dynamic';

export const GaugeRegistrarUnregisterGaugeActionDetails = dynamic(() =>
    import('./gaugeRegistrarUnregisterGaugeActionDetails').then(
        (mod) => mod.GaugeRegistrarUnregisterGaugeActionDetails,
    ),
);

export type { IGaugeRegistrarUnregisterGaugeActionDetailsProps } from './gaugeRegistrarUnregisterGaugeActionDetails';
