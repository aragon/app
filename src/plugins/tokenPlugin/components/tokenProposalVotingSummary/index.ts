import dynamic from 'next/dynamic';

export const TokenProposalVotingSummary = dynamic(() =>
    import('./tokenProposalVotingSummary').then((mod) => mod.TokenProposalVotingSummary),
);
export const TokenProposalVotingSummaryNoEarlyExecution = dynamic(() =>
    import('./tokenProposalVotingSummaryNoEarlyExecution').then(
        (mod) => mod.TokenProposalVotingSummaryNoEarlyExecution,
    ),
);

export type { ITokenProposalVotingSummaryProps } from './tokenProposalVotingSummary';
