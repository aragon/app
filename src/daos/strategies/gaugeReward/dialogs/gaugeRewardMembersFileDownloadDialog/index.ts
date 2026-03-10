import dynamic from 'next/dynamic';

export const GaugeRewardMembersFileDownloadDialog = dynamic(() =>
    import('./gaugeRewardMembersFileDownloadDialog').then(
        (mod) => mod.GaugeRewardMembersFileDownloadDialog,
    ),
);

export type { IGaugeRewardMembersFileDownloadDialogParams } from './gaugeRewardMembersFileDownloadDialog';
