import dynamic from 'next/dynamic';

export type { ITokenLocksDialogParams, ITokenLocksDialogProps } from './tokenLocksDialog';

export const TokenLocksDialog = dynamic(() => import('./tokenLocksDialog').then((mod) => mod.TokenLocksDialog));
