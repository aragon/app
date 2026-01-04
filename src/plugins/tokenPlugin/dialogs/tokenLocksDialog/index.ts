import dynamic from 'next/dynamic';

export const TokenLocksDialog = dynamic(() =>
    import('./tokenLocksDialog').then((mod) => mod.TokenLocksDialog),
);
export type {
    ITokenLocksDialogParams,
    ITokenLocksDialogProps,
} from './tokenLocksDialog';
