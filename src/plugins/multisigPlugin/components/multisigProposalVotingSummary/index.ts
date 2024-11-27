import dynamic from 'next/dynamic';

export const MultisigProposalVotingSummary = dynamic(() =>
    import('./multisigProposalVotingSummary').then((mod) => mod.MultisigProposalVotingSummary),
);

export type { IMultisigProposalVotingSummaryProps } from './multisigProposalVotingSummary';
