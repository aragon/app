import dynamic from 'next/dynamic';

export const TokenLockUnlockDialog = dynamic(() =>
    import('./tokenLockUnlockDialog').then((mod) => mod.TokenLockUnlockDialog),
);

export type { ITokenLockUnlockDialogParams, ITokenLockUnlockDialogProps } from './tokenLockUnlockDialog';
