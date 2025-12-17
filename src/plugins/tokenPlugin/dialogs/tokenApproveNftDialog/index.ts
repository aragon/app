import dynamic from 'next/dynamic';

export const TokenApproveNftDialog = dynamic(() => import('./tokenApproveNftDialog').then((mod) => mod.TokenApproveNftDialog));

export type {
    ITokenApproveNftDialogParams,
    ITokenApproveNftDialogProps,
} from './tokenApproveNftDialog';
