import dynamic from 'next/dynamic';

export const GaugeRegistrarUnegisterGaugeActionReadOnly = dynamic(() =>
    import('./gaugeRegistrarUnegisterGaugeActionReadOnly').then(
        (mod) => mod.GaugeRegistrarUnegisterGaugeActionReadOnly,
    ),
);

export type { IGaugeRegistrarUnregisterGaugeActionReadOnlyProps } from './gaugeRegistrarUnegisterGaugeActionReadOnly';
