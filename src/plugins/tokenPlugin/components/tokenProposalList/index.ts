import dynamic from 'next/dynamic';

export const TokenProposalList = dynamic(() => import('./tokenProposalList').then((mod) => mod.TokenProposalList));
export { type ITokenProposalListProps } from './tokenProposalList';
