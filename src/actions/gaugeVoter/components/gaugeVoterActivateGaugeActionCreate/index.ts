import dynamic from 'next/dynamic';

export const GaugeVoterActivateGaugeActionCreate = dynamic(() =>
    import('./gaugeVoterActivateGaugeActionCreate').then((mod) => mod.GaugeVoterActivateGaugeActionCreate),
);

export type { IGaugeVoterActivateGaugeActionCreateProps } from './gaugeVoterActivateGaugeActionCreate';
