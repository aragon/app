import dynamic from 'next/dynamic';

export const GaugeRegistrarRegisterGaugeActionReadOnly = dynamic(() =>
    import('./gaugeRegistrarRegisterGaugeActionReadOnly').then((mod) => mod.GaugeRegistrarRegisterGaugeActionReadOnly),
);

export type { IGaugeRegistrarRegisterGaugeActionReadOnlyProps } from './gaugeRegistrarRegisterGaugeActionReadOnly';
