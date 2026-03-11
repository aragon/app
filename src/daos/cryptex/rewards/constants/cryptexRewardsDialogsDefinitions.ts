import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CryptexRewardsMembersFileDownloadDialog } from '../dialogs/cryptexRewardsMembersFileDownloadDialog';
import { CryptexRewardsDialogId } from './cryptexRewardsDialogId';

export const cryptexRewardsDialogsDefinitions: Record<
    CryptexRewardsDialogId,
    IDialogComponentDefinitions
> = {
    [CryptexRewardsDialogId.CRYPTEX_REWARDS_MEMBERS_FILE_DOWNLOAD]: {
        Component: CryptexRewardsMembersFileDownloadDialog,
    },
};
