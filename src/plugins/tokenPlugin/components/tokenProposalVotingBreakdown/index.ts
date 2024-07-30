import dynamic from 'next/dynamic';

export const TokenProposalVotingBreakdown = dynamic(() =>
    import('./tokenProposalVotingBreakdown').then((mod) => mod.TokenProposalVotingBreakdown),
);
export type { ITokenProposalVotingBreakdownProps } from './tokenProposalVotingBreakdown';
