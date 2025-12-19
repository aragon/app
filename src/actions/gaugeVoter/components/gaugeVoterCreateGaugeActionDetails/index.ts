import dynamic from 'next/dynamic';

export const GaugeVoterCreateGaugeActionDetails = dynamic(() =>
    import('./gaugeVoterCreateGaugeActionDetails').then((mod) => mod.GaugeVoterCreateGaugeActionDetails),
);

export type { IGaugeVoterCreateGaugeActionDetailsProps } from './gaugeVoterCreateGaugeActionDetails';
