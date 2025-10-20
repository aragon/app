import dynamic from 'next/dynamic';

export const GaugeRegistrarUnregisterGaugeAction = dynamic(() =>
    import('./gaugeRegistrarUnregisterGaugeAction').then((mod) => mod.GaugeRegistrarUnregisterGaugeAction),
);

export type { IGaugeRegistrarUnregisterGaugeActionProps } from './gaugeRegistrarUnregisterGaugeAction';
