import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AdvanceStageDialog } from '../dialogs/advanceStageDialog';
import { SppPluginDialogId } from './sppPluginDialogId';

export const sppPluginDialogsDefinitions: Record<SppPluginDialogId, IDialogComponentDefinitions> = {
    [SppPluginDialogId.ADVANCE_STAGE]: {
        Component: AdvanceStageDialog,
    },
};
