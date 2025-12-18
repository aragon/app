import dynamic from 'next/dynamic';

export type { ITokenLockUnlockDialogParams, ITokenLockUnlockDialogProps } from './tokenLockUnlockDialog';

export const TokenLockUnlockDialog = dynamic(() => import('./tokenLockUnlockDialog').then((mod) => mod.TokenLockUnlockDialog));
