import dynamic from 'next/dynamic';

export const GaugeVoterUpdateGaugeMetadataActionDetails = dynamic(() =>
    import('./gaugeVoterUpdateGaugeMetadataActionDetails').then(
        (mod) => mod.GaugeVoterUpdateGaugeMetadataActionDetails,
    ),
);

export type { IGaugeVoterUpdateGaugeMetadataActionDetailsProps } from './gaugeVoterUpdateGaugeMetadataActionDetails';
