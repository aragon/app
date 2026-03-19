import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CryptexMembersFileDownloadDialog } from '../dialogs/cryptexMembersFileDownloadDialog';
import { CryptexDialogId } from './cryptexDialogId';

export const tokenRewardDialogsDefinitions: Record<
    CryptexDialogId,
    IDialogComponentDefinitions
> = {
    [CryptexDialogId.CRYPTEX_MEMBERS_FILE_DOWNLOAD]: {
        Component: CryptexMembersFileDownloadDialog,
    },
};
