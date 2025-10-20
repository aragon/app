import dynamic from 'next/dynamic';

export const GaugeRegistrarRegisterGaugeAction = dynamic(() =>
    import('./gaugeRegistrarRegisterGaugeAction').then((mod) => mod.GaugeRegistrarRegisterGaugeAction),
);

export type { IGaugeRegistrarRegisterGaugeActionProps } from './gaugeRegistrarRegisterGaugeAction';
