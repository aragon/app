import dynamic from 'next/dynamic';

export const TokenDelegationDialog = dynamic(() =>
    import('./tokenDelegationDialog').then((mod) => mod.TokenDelegationDialog),
);
export type { ITokenDelegationDialogParams, ITokenDelegationDialogProps } from './tokenDelegationDialog';
