import dynamic from 'next/dynamic';

export const MultisigProposalsPageDetails = dynamic(() =>
    import('./multisigProposalVotingBreakdown').then((mod) => mod.MultisigProposalVotingBreakdown),
);
export type { IMultisigProposalVotingBreakdownProps } from './multisigProposalVotingBreakdown';
