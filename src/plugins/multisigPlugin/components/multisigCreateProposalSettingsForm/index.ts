import dynamic from 'next/dynamic';

export const MultisigCreateProposalSettingsForm = dynamic(() =>
    import('./multisigCreateProposalSettingsForm').then((mod) => mod.MultisigCreateProposalSettingsForm),
);
export { type IMultisigCreateProposalSettingsFormProps } from './multisigCreateProposalSettingsForm';
