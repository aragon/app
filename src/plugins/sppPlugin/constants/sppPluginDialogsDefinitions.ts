import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AdvanceStageDialog } from '../dialogs/advanceStageDialog';
import { InvalidAddressConnectedDialog } from '../dialogs/invalidAddressConnectedDialog';
import { ReportProposalResultDialog } from '../dialogs/reportProposalResultDialog';
import { SppPluginDialogId } from './sppPluginDialogId';

export const sppPluginDialogsDefinitions: Record<SppPluginDialogId, IDialogComponentDefinitions> = {
    [SppPluginDialogId.ADVANCE_STAGE]: {
        Component: AdvanceStageDialog,
    },
    [SppPluginDialogId.REPORT_PROPOSAL_RESULT]: {
        Component: ReportProposalResultDialog,
    },
    [SppPluginDialogId.INVALID_ADDRESS_CONNECTED]: {
        Component: InvalidAddressConnectedDialog,
    },
};
