import dynamic from 'next/dynamic';

export const MultisigProposalList = dynamic(() =>
    import('./multisigProposalList').then((mod) => mod.MultisigProposalList),
);
export { type IMultisigProposalListProps } from './multisigProposalList';
