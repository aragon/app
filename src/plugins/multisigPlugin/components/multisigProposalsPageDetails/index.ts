import dynamic from 'next/dynamic';

export const MultisigProposalsPageDetails = dynamic(() =>
    import('./multisigProposalsPageDetails').then((mod) => mod.MultisigProposalsPageDetails),
);
export type { IMultisigProposalsPageDetailsProps } from './multisigProposalsPageDetails';
