import dynamic from 'next/dynamic';

export const TokenSubmitVote = dynamic(() =>
    import('./tokenSubmitVote').then((mod) => mod.TokenSubmitVote),
);

export {
    type IDisabledVotingOption,
    type ITokenVotingOptionsProps,
    TokenVotingOptions,
} from './components/tokenVotingOptions';
export type { ITokenSubmitVoteProps } from './tokenSubmitVote';
