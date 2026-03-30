import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CryptexDialogId } from './cryptexDialogId';

export const tokenRewardDialogsDefinitions: Record<
    CryptexDialogId,
    IDialogComponentDefinitions
> = {
    [CryptexDialogId.CRYPTEX_MEMBERS_FILE_DOWNLOAD]: {
        Component: dynamic(() =>
            import('../dialogs/cryptexMembersFileDownloadDialog').then(
                (m) => m.CryptexMembersFileDownloadDialog,
            ),
        ),
    },
};
