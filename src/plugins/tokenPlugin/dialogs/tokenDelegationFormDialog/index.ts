import dynamic from 'next/dynamic';

export const TokenDelegationFormDialog = dynamic(() =>
    import('./tokenDelegationFormDialog').then((mod) => mod.TokenDelegationFormDialog),
);
export type { ITokenDelegationFormDialogProps } from './tokenDelegationFormDialog';
