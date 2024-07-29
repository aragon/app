import dynamic from 'next/dynamic';

export const TokenProposalsPageDetails = dynamic(() =>
    import('./tokenProposalVotingBreakdown').then((mod) => mod.TokenProposalVotingBreakdown),
);
export type { ITokenProposalVotingBreakdownProps } from './tokenProposalVotingBreakdown';
