import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenRewardMembersFileDownloadDialog } from '../dialogs/tokenRewardMembersFileDownloadDialog';
import { TokenRewardDialogId } from './tokenRewardDialogId';

export const tokenRewardDialogsDefinitions: Record<
    TokenRewardDialogId,
    IDialogComponentDefinitions
> = {
    [TokenRewardDialogId.TOKEN_REWARD_MEMBERS_FILE_DOWNLOAD]: {
        Component: TokenRewardMembersFileDownloadDialog,
    },
};
