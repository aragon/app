import dynamic from 'next/dynamic';

export const TokenSubmitVote = dynamic(() => import('./tokenSubmitVote').then((mod) => mod.TokenSubmitVote));

export { type ITokenSubmitVoteProps } from './tokenSubmitVote';
