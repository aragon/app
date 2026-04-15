import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { StatusMembersFileDownloadDialog } from '../dialogs/statusMembersFileDownloadDialog';
import { StatusDialogId } from './statusDialogId';

export const statusDialogsDefinitions: Record<
    StatusDialogId,
    IDialogComponentDefinitions
> = {
    [StatusDialogId.MEMBERS_FILE_DOWNLOAD]: {
        Component: StatusMembersFileDownloadDialog,
    },
};
