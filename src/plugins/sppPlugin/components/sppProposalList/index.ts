import dynamic from 'next/dynamic';

export const SppProposalList = dynamic(() => import('./sppProposalList').then((mod) => mod.SppProposalList));
export { type ISppProposalListProps } from './sppProposalList';
