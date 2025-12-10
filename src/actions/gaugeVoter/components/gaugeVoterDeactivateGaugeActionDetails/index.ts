import dynamic from 'next/dynamic';

export const GaugeVoterDeactivateGaugeActionDetails = dynamic(() =>
    import('./gaugeVoterDeactivateGaugeActionDetails').then((mod) => mod.GaugeVoterDeactivateGaugeActionDetails),
);

export type { IGaugeVoterDeactivateGaugeActionDetailsProps } from './gaugeVoterDeactivateGaugeActionDetails';
