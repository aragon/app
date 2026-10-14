import dynamic from 'next/dynamic';

export const TokenMintActionDetails = dynamic(() =>
    import('./tokenMintActionDetails').then(
        (mod) => mod.TokenMintActionDetails,
    ),
);

export type { ITokenMintActionDetailsProps } from './tokenMintActionDetails';
