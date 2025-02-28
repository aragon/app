import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { PublishManageAdminsProposalDialog } from '../dialogs/publishManageAdminsProposal';

export enum AdminDialog {
    PUBLISH_MANAGE_ADMINS = 'PUBLISH_MANAGE_ADMINS',
}

export const adminDialogs: Record<AdminDialog, IDialogComponentDefinitions> = {
    [AdminDialog.PUBLISH_MANAGE_ADMINS]: { Component: PublishManageAdminsProposalDialog },
};
