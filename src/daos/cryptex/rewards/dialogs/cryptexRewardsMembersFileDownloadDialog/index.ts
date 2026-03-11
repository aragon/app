import dynamic from 'next/dynamic';

export const CryptexRewardsMembersFileDownloadDialog = dynamic(() =>
    import('./cryptexRewardsMembersFileDownloadDialog').then(
        (mod) => mod.CryptexRewardsMembersFileDownloadDialog,
    ),
);

export type {
    ICryptexRewardsMembersFileDownloadDialogParams,
    ICryptexRewardsMembersFileDownloadDialogProps,
} from './cryptexRewardsMembersFileDownloadDialog';
