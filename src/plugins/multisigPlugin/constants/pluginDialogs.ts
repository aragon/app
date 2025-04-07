import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { MultisigRemoveMembersActionDialog } from '../dialogs/multisigRemoveMembersActionDialog';

export enum MultisigPluginDialog {
    REMOVE_MEMBERS = 'REMOVE_MEMBERS',
}

export const multisigPluginDialogs: Record<MultisigPluginDialog, IDialogComponentDefinitions> = {
    [MultisigPluginDialog.REMOVE_MEMBERS]: {
        Component: MultisigRemoveMembersActionDialog,
    },
};
