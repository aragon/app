import dynamic from 'next/dynamic';

export const MultisigSubmitVote = dynamic(() => import('./multisigSubmitVote').then((mod) => mod.MultisigSubmitVote));
export { type IMultisigSubmitVoteProps } from './multisigSubmitVote';
