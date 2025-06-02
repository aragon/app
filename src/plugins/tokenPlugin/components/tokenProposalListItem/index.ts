import dynamic from 'next/dynamic';

export const TokenProposalListItem = dynamic(() =>
    import('./tokenProposalListItem').then((mod) => mod.TokenProposalListItem),
);
export type { ITokenProposalListItemProps } from './tokenProposalListItem';
