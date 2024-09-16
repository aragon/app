import dynamic from 'next/dynamic';

export const TokenVoteOptions = dynamic(() => import('./tokenVoteOptions').then((mod) => mod.TokenVoteOptions));

export { type ITokenVoteOptionsProps } from './tokenVoteOptions';
