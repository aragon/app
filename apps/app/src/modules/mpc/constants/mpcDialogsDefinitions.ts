import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { MpcAddMemberDialog } from '../dialogs/mpcAddMemberDialog';
import { MpcApproveRequestDialog } from '../dialogs/mpcApproveRequestDialog';
import { MpcEditPolicyDialog } from '../dialogs/mpcEditPolicyDialog';
import { MpcExportKeyDialog } from '../dialogs/mpcExportKeyDialog';
import { MpcNewRequestDialog } from '../dialogs/mpcNewRequestDialog';
import { MpcRecoverDialog } from '../dialogs/mpcRecoverDialog';
import { MpcReshareDialog } from '../dialogs/mpcReshareDialog';
import { MpcSignRequestDialog } from '../dialogs/mpcSignRequestDialog';
import { MpcDialogId } from './mpcDialogId';

export const mpcDialogsDefinitions: Record<
    MpcDialogId,
    IDialogComponentDefinitions
> = {
    [MpcDialogId.NEW_REQUEST]: { Component: MpcNewRequestDialog, size: 'lg' },
    [MpcDialogId.SIGN_REQUEST]: { Component: MpcSignRequestDialog, size: 'lg' },
    [MpcDialogId.APPROVE_REQUEST]: { Component: MpcApproveRequestDialog },
    [MpcDialogId.RESHARE]: { Component: MpcReshareDialog },
    [MpcDialogId.RECOVER]: { Component: MpcRecoverDialog },
    [MpcDialogId.EXPORT_KEY]: { Component: MpcExportKeyDialog },
    [MpcDialogId.ADD_MEMBER]: { Component: MpcAddMemberDialog },
    [MpcDialogId.EDIT_POLICY]: { Component: MpcEditPolicyDialog, size: 'lg' },
};
