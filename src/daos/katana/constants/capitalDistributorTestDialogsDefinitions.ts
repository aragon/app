import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CapitalDistributorTestMembersFileDownloadDialog } from '../dialogs/capitalDistributorTestMembersFileDownloadDialog';
import { CapitalDistributorTestDialogId } from './capitalDistributorTestDialogId';

export const gaugeRewardDialogsDefinitions: Record<
    CapitalDistributorTestDialogId,
    IDialogComponentDefinitions
> = {
    [CapitalDistributorTestDialogId.MEMBERS_FILE_DOWNLOAD]: {
        Component: CapitalDistributorTestMembersFileDownloadDialog,
    },
};
