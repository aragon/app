import dynamic from 'next/dynamic';

export const TokenProposalsPageDetails = dynamic(() =>
    import('./tokenProposalsPageDetails').then((mod) => mod.TokenProposalsPageDetails),
);
export type { ITokenProposalsPageDetailsProps } from './tokenProposalsPageDetails';
