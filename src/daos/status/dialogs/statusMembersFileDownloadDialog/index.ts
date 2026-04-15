import dynamic from 'next/dynamic';

export const StatusMembersFileDownloadDialog = dynamic(() =>
    import('./statusMembersFileDownloadDialog').then(
        (mod) => mod.StatusMembersFileDownloadDialog,
    ),
);

export type { IStatusMembersFileDownloadDialogParams } from './statusMembersFileDownloadDialog';
