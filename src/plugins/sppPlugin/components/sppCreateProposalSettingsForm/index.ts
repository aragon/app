import dynamic from 'next/dynamic';

export const SppCreateProposalSettingsForm = dynamic(() =>
    import('./sppCreateProposalSettingsForm').then((mod) => mod.SppCreateProposalSettingsForm),
);
export { type ISppCreateProposalSettingsFormProps } from './sppCreateProposalSettingsForm';
