import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AdvanceStageDialog } from '../dialogs/advanceStageDialog';
import { SppInvalidAddressConnectedDialog } from '../dialogs/sppInvalidAddressConnectedDialog';
import { SppReportProposalResultDialog } from '../dialogs/sppReportProposalResultDialog';
import { SppPluginDialogId } from './sppPluginDialogId';

export const sppPluginDialogsDefinitions: Record<SppPluginDialogId, IDialogComponentDefinitions> = {
    [SppPluginDialogId.ADVANCE_STAGE]: {
        Component: AdvanceStageDialog,
    },
    [SppPluginDialogId.REPORT_PROPOSAL_RESULT]: {
        Component: SppReportProposalResultDialog,
    },
    [SppPluginDialogId.INVALID_ADDRESS_CONNECTED]: {
        Component: SppInvalidAddressConnectedDialog,
    },
};
