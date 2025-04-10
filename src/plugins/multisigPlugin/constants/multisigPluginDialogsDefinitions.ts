import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { MultisigRemoveMembersActionDialog } from '../dialogs/multisigRemoveMembersActionDialog';
import { MultisigPluginDialogId } from './multisigPluginDialogId';

export const multisigPluginDialogsDefinitions: Record<MultisigPluginDialogId, IDialogComponentDefinitions> = {
    [MultisigPluginDialogId.REMOVE_MEMBERS]: {
        Component: MultisigRemoveMembersActionDialog,
    },
};
