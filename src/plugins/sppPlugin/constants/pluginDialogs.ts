import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AdvanceStageDialog } from '../dialogs/advanceStageDialog';

export enum SppPluginDialog {
    ADVANCE_STAGE = 'ADVANCE_STAGE',
}

export const sppPluginDialogs: Record<SppPluginDialog, IDialogComponentDefinitions> = {
    [SppPluginDialog.ADVANCE_STAGE]: {
        Component: AdvanceStageDialog,
    },
};
