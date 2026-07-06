import dynamic from 'next/dynamic';

export const GaugeVoterDeactivateGaugeActionCreate = dynamic(() =>
    import('./gaugeVoterDeactivateGaugeActionCreate').then(
        (mod) => mod.GaugeVoterDeactivateGaugeActionCreate,
    ),
);

export type { IGaugeVoterDeactivateGaugeActionCreateProps } from './gaugeVoterDeactivateGaugeActionCreate';
