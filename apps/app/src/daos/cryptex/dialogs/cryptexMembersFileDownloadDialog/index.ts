import dynamic from 'next/dynamic';

export const CryptexMembersFileDownloadDialog = dynamic(() =>
    import('./cryptexMembersFileDownloadDialog').then(
        (mod) => mod.CryptexMembersFileDownloadDialog,
    ),
);

export type { ICryptexMembersFileDownloadDialogParams } from './cryptexMembersFileDownloadDialog';
