import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { MultisigRemoveMembersActionDialog } from '../dialogs/multisigRemoveMembersActionDialog';
import { MultisigPluginDialog } from './multisigPluginDialogId';

export const multisigPluginDialogs: Record<MultisigPluginDialog, IDialogComponentDefinitions> = {
    [MultisigPluginDialog.REMOVE_MEMBERS]: {
        Component: MultisigRemoveMembersActionDialog,
    },
};
