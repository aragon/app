import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { SppPluginDialogId } from './sppPluginDialogId';

export const sppPluginDialogsDefinitions: Record<
    SppPluginDialogId,
    IDialogComponentDefinitions
> = {
    [SppPluginDialogId.ADVANCE_STAGE]: {
        Component: dynamic(() =>
            import('../dialogs/sppAdvanceStageDialog').then(
                (m) => m.SppAdvanceStageDialog,
            ),
        ),
    },
    [SppPluginDialogId.REPORT_PROPOSAL_RESULT]: {
        Component: dynamic(() =>
            import('../dialogs/sppReportProposalResultDialog').then(
                (m) => m.SppReportProposalResultDialog,
            ),
        ),
    },
    [SppPluginDialogId.INVALID_ADDRESS_CONNECTED]: {
        Component: dynamic(() =>
            import('../dialogs/sppInvalidAddressConnectedDialog').then(
                (m) => m.SppInvalidAddressConnectedDialog,
            ),
        ),
    },
};
