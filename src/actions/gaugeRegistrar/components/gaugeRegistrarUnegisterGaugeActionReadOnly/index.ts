import dynamic from 'next/dynamic';

export const RaugeRegistrarUnegisterGaugeActionReadOnly = dynamic(() =>
    import('./gaugeRegistrarUnegisterGaugeActionReadOnly').then(
        (mod) => mod.GaugeRegistrarUnegisterGaugeActionReadOnly,
    ),
);

export type { IGaugeRegistrarUnregisterGaugeActionReadOnlyProps } from './gaugeRegistrarUnegisterGaugeActionReadOnly';
