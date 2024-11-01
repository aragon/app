import dynamic from 'next/dynamic';

export const MintTokensAction = dynamic(() => import('./mintTokensAction').then((mod) => mod.MintTokensAction));

export type { IMintTokensActionProps } from './mintTokensAction';
