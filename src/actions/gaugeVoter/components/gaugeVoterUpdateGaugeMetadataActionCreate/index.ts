import dynamic from 'next/dynamic';

export const GaugeVoterUpdateGaugeMetadataActionCreate = dynamic(() =>
    import('./gaugeVoterUpdateGaugeMetadataActionCreate').then((mod) => mod.GaugeVoterUpdateGaugeMetadataActionCreate)
);

export type { IGaugeVoterUpdateGaugeMetadataActionCreateProps } from './gaugeVoterUpdateGaugeMetadataActionCreate';

export {
    GaugeVoterUpdateGaugeMetadataActionCreateForm,
    type IGaugeVoterUpdateGaugeMetadataActionCreateFormProps,
    type IGaugeVoterUpdateGaugeMetadataFormData,
} from './gaugeVoterUpdateGaugeMetadataActionCreateForm';
