import dynamic from 'next/dynamic';

export const TokenRewardMembersFileDownloadDialog = dynamic(() =>
    import('./tokenRewardMembersFileDownloadDialog').then(
        (mod) => mod.TokenRewardMembersFileDownloadDialog,
    ),
);

export type {
    ITokenRewardMembersFileDownloadDialogParams,
    ITokenRewardMembersFileDownloadDialogProps,
} from './tokenRewardMembersFileDownloadDialog';
