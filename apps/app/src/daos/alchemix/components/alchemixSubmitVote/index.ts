import dynamic from 'next/dynamic';

export const AlchemixSubmitVote = dynamic(() =>
    import('./alchemixSubmitVote').then((mod) => mod.AlchemixSubmitVote),
);

export type { IAlchemixSubmitVoteProps } from './alchemixSubmitVote';
