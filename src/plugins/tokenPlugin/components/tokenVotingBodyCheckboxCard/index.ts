import dynamic from 'next/dynamic';

export const TokenVotingBodyCheckboxCard = dynamic(() =>
    import('./tokenVotingBodyCheckboxCard').then((mod) => mod.TokenVotingBodyCheckboxCard),
);

export type { ITokenCreateProcessFormBody, ITokenVotingBodyCheckboxCardProps } from './tokenVotingBodyCheckboxCard.api';
