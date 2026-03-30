import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { KatanaDialogId } from './katanaDialogId';

export const katanaDialogsDefinitions: Record<
    KatanaDialogId,
    IDialogComponentDefinitions
> = {
    [KatanaDialogId.MEMBERS_FILE_DOWNLOAD]: {
        Component: dynamic(() =>
            import(
                '../dialogs/capitalDistributorTestMembersFileDownloadDialog'
            ).then((m) => m.CapitalDistributorTestMembersFileDownloadDialog),
        ),
    },
};
