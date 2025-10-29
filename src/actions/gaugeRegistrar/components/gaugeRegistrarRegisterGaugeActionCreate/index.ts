import dynamic from 'next/dynamic';

export const GaugeRegistrarRegisterGaugeActionCreate = dynamic(() =>
    import('./gaugeRegistrarRegisterGaugeActionCreate').then((mod) => mod.GaugeRegistrarRegisterGaugeActionCreate),
);

export type { IGaugeRegistrarRegisterGaugeActionCreateProps } from './gaugeRegistrarRegisterGaugeActionCreate';
