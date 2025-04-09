import dynamic from 'next/dynamic';

export const TokenApproveTokensDialog = dynamic(() =>
    import('./tokenApproveTokensDialog').then((mod) => mod.TokenApproveTokensDialog),
);

export type { ITokenApproveTokensDialogParams, ITokenApproveTokensDialogProps } from './tokenApproveTokensDialog';
