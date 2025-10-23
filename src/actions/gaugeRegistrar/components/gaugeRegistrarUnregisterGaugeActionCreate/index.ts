import dynamic from 'next/dynamic';

export const GaugeRegistrarUnregisterGaugeActionCreate = dynamic(() =>
    import('./gaugeRegistrarUnregisterGaugeActionCreate').then((mod) => mod.GaugeRegistrarUnregisterGaugeActionCreate),
);

export type { IGaugeRegistrarUnregisterGaugeActionCreateProps } from './gaugeRegistrarUnregisterGaugeActionCreate';
