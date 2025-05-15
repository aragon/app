import dynamic from 'next/dynamic';

export const TokenMintTokensAction = dynamic(() =>
    import('./tokenMintTokensAction').then((mod) => mod.TokenMintTokensAction),
);

export type { ITokenMintTokensActionProps } from './tokenMintTokensAction';
