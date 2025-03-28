import dynamic from 'next/dynamic';

export const TokenProposalCreationSettings = dynamic(() =>
    import('./tokenProposalCreationSettings').then((mod) => mod.TokenProposalCreationSettings),
);

export type { ITokenProposalCreationSettingsProps } from './tokenProposalCreationSettings';
