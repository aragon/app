import dynamic from 'next/dynamic';

export const CapitalDistributorTestMembersFileDownloadDialog = dynamic(() =>
    import('./capitalDistributorTestMembersFileDownloadDialog').then(
        (mod) => mod.CapitalDistributorTestMembersFileDownloadDialog,
    ),
);

export type { ICapitalDistributorTestMembersFileDownloadDialogParams } from './capitalDistributorTestMembersFileDownloadDialog';
