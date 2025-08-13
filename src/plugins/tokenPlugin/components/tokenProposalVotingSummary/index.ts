import dynamic from 'next/dynamic';

export const TokenProposalVotingSummary = dynamic(() =>
    import('./tokenProposalVotingSummary').then((mod) => mod.TokenProposalVotingSummary),
);

export type { ITokenProposalVotingSummaryProps } from './tokenProposalVotingSummary';
