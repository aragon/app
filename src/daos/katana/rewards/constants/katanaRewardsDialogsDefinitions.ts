import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { KatanaRewardsMembersFileDownloadDialog } from '../dialogs/katanaRewardsMembersFileDownloadDialog';
import { KatanaRewardsDialogId } from './katanaRewardsDialogId';

export const katanaRewardsDialogsDefinitions: Record<
    KatanaRewardsDialogId,
    IDialogComponentDefinitions
> = {
    [KatanaRewardsDialogId.KATANA_REWARDS_MEMBERS_FILE_DOWNLOAD]: {
        Component: KatanaRewardsMembersFileDownloadDialog,
    },
};
