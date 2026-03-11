import dynamic from 'next/dynamic';

export const KatanaRewardsMembersFileDownloadDialog = dynamic(() =>
    import('./katanaRewardsMembersFileDownloadDialog').then(
        (mod) => mod.KatanaRewardsMembersFileDownloadDialog,
    ),
);

export type { IKatanaRewardsMembersFileDownloadDialogParams } from './katanaRewardsMembersFileDownloadDialog';
