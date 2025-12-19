import dynamic from 'next/dynamic';

export const SppProposalListItem = dynamic(() =>
    import('./sppProposalListItem').then((mod) => mod.SppProposalListItem),
);
export type { ISppProposalListItemProps } from './sppProposalListItem';
