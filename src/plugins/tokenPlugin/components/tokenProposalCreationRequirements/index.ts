import dynamic from 'next/dynamic';

export const TokenProposalCreationRequirements = dynamic(() =>
    import('./tokenProposalCreationRequirements').then((mod) => mod.TokenProposalCreationRequirements),
);

export type { ITokenProposalCreationRequirementsProps } from './tokenProposalCreationRequirements';
