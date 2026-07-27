import dynamic from 'next/dynamic';

export const AlchemixSubmitVoteOverride = dynamic(() =>
    import('./alchemixSubmitVoteOverride').then(
        (mod) => mod.AlchemixSubmitVoteOverride,
    ),
);

export type { IAlchemixSubmitVoteOverrideProps } from './alchemixSubmitVoteOverride';
