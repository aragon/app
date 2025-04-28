import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { SppAdvanceStageDialog } from '../dialogs/sppAdvanceStageDialog';
import { SppInvalidAddressConnectedDialog } from '../dialogs/sppInvalidAddressConnectedDialog';
import { SppReportProposalResultDialog } from '../dialogs/sppReportProposalResultDialog';
import { SppPluginDialogId } from './sppPluginDialogId';

export const sppPluginDialogsDefinitions: Record<SppPluginDialogId, IDialogComponentDefinitions> = {
    [SppPluginDialogId.ADVANCE_STAGE]: {
        Component: SppAdvanceStageDialog,
    },
    [SppPluginDialogId.REPORT_PROPOSAL_RESULT]: {
        Component: SppReportProposalResultDialog,
    },
    [SppPluginDialogId.INVALID_ADDRESS_CONNECTED]: {
        Component: SppInvalidAddressConnectedDialog,
    },
};
