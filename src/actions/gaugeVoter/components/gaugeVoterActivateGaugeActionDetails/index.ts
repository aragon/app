import dynamic from 'next/dynamic';

export const GaugeVoterActivateGaugeActionDetails = dynamic(() =>
    import('./gaugeVoterActivateGaugeActionDetails').then(
        (mod) => mod.GaugeVoterActivateGaugeActionDetails,
    ),
);

export type { IGaugeVoterActivateGaugeActionDetailsProps } from './gaugeVoterActivateGaugeActionDetails';
