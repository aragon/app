import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeDistributionsMembersFileDownloadDialog } from '../dialogs/gaugeDistributionsMembersFileDownloadDialog';
import { GaugeDistributionsDialogId } from './gaugeDistributionsDialogId';

export const gaugeDistributionsDialogsDefinitions: Record<
    GaugeDistributionsDialogId,
    IDialogComponentDefinitions
> = {
    [GaugeDistributionsDialogId.MEMBERS_FILE_DOWNLOAD]: {
        Component: GaugeDistributionsMembersFileDownloadDialog,
    },
};
