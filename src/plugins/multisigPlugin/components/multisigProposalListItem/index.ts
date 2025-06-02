import dynamic from 'next/dynamic';

export const MultisigProposalListItem = dynamic(() =>
    import('./multisigProposalListItem').then((mod) => mod.MultisigProposalListItem),
);
export type { IMultisigProposalListItemProps } from './multisigProposalListItem';
