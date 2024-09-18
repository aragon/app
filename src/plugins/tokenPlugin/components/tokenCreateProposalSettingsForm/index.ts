import dynamic from 'next/dynamic';

export const TokenCreateProposalSettingsForm = dynamic(() =>
    import('./tokenCreateProposalSettingsForm').then((mod) => mod.TokenCreateProposalSettingsForm),
);
export { type ITokenCreateProposalSettingsFormProps } from './tokenCreateProposalSettingsForm';
