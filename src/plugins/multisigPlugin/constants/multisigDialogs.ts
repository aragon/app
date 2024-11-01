import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { RemoveMembersDialog } from '../dialogs/removeMemberDialog';

export enum MultisigDialogs {
    MULTISIG_REMOVE_MEMBERS = 'MULTISIG_REMOVE_MEMBERS',
}

export const multisigDialogs: Record<MultisigDialogs, IDialogComponentDefinitions> = {
    [MultisigDialogs.MULTISIG_REMOVE_MEMBERS]: {
        Component: RemoveMembersDialog,
        description: 'app.plugins.multisig.multisigRemoveMembersDialog.description',
    },
};
