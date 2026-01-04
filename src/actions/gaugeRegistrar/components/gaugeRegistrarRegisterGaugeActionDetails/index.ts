import dynamic from 'next/dynamic';

export const GaugeRegistrarRegisterGaugeActionDetails = dynamic(() =>
    import('./gaugeRegistrarRegisterGaugeActionDetails').then(
        (mod) => mod.GaugeRegistrarRegisterGaugeActionDetails,
    ),
);

export type { IGaugeRegistrarRegisterGaugeActionDetailsProps } from './gaugeRegistrarRegisterGaugeActionDetails';
