import dynamic from 'next/dynamic';

export const MultisigVoteList = dynamic(() => import('./multisigVoteList').then((mod) => mod.MultisigVoteList));
export { type IMultisigVoteListProps } from './multisigVoteList';
