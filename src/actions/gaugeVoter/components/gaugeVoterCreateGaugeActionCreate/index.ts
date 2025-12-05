import dynamic from 'next/dynamic';

export const GaugeVoterCreateGaugeActionCreate = dynamic(() =>
    import('./gaugeVoterCreateGaugeActionCreate').then((mod) => mod.GaugeVoterCreateGaugeActionCreate),
);

export type { IGaugeVoterCreateGaugeActionCreateProps } from './gaugeVoterCreateGaugeActionCreate';

export {
    GaugeVoterCreateGaugeActionCreateForm,
    type IGaugeVoterCreateGaugeActionCreateFormProps,
    type IGaugeVoterCreateGaugeFormData,
} from './gaugeVoterCreateGaugeActionCreateForm';
