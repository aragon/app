import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AdvanceStageDialog } from '../dialogs/advanceStageDialog';
import { SppPluginDialog } from './sppPluginDialogId';

export const sppPluginDialogs: Record<SppPluginDialog, IDialogComponentDefinitions> = {
    [SppPluginDialog.ADVANCE_STAGE]: {
        Component: AdvanceStageDialog,
    },
};
