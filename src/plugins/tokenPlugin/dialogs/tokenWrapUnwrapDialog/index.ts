import dynamic from 'next/dynamic';

export type { ITokenWrapUnwrapDialogParams, ITokenWrapUnwrapDialogProps } from './tokenWrapUnwrapDialog';

export const TokenWrapUnwrapDialog = dynamic(() =>
    import('./tokenWrapUnwrapDialog').then((mod) => mod.TokenWrapUnwrapDialog),
);
