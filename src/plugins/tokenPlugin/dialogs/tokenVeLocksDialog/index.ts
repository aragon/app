import dynamic from 'next/dynamic';

export type { ITokenVeLocksDialogParams, ITokenVeLocksDialogProps } from './tokenVeLocksDialog';

export const TokenVeLocksDialog = dynamic(() => import('./tokenVeLocksDialog').then((mod) => mod.TokenVeLocksDialog));
