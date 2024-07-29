import dynamic from 'next/dynamic';

export const TokenVoteList = dynamic(() => import('./tokenVoteList').then((mod) => mod.TokenVoteList));
export { type ITokenVoteListProps } from './tokenVoteList';
