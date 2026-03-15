import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CapitalDistributorTestMembersFileDownloadDialog } from '../dialogs/capitalDistributorTestMembersFileDownloadDialog';
import { KatanaDialogId } from './katanaDialogId';

export const katanaDialogsDefinitions: Record<
    KatanaDialogId,
    IDialogComponentDefinitions
> = {
    [KatanaDialogId.MEMBERS_FILE_DOWNLOAD]: {
        Component: CapitalDistributorTestMembersFileDownloadDialog,
    },
};
