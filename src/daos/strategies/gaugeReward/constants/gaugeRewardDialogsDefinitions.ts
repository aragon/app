import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeRewardMembersFileDownloadDialog } from '../dialogs/gaugeRewardMembersFileDownloadDialog';
import { GaugeRewardDialogId } from './gaugeRewardDialogId';

export const gaugeRewardDialogsDefinitions: Record<
    GaugeRewardDialogId,
    IDialogComponentDefinitions
> = {
    [GaugeRewardDialogId.GAUGE_REWARD_MEMBERS_FILE_DOWNLOAD]: {
        Component: GaugeRewardMembersFileDownloadDialog,
    },
};
