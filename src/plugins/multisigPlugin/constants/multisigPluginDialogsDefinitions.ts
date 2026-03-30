import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { MultisigPluginDialogId } from './multisigPluginDialogId';

export const multisigPluginDialogsDefinitions: Record<
    MultisigPluginDialogId,
    IDialogComponentDefinitions
> = {
    [MultisigPluginDialogId.REMOVE_MEMBERS]: {
        Component: dynamic(() =>
            import('../dialogs/multisigRemoveMembersActionDialog').then(
                (m) => m.MultisigRemoveMembersActionDialog,
            ),
        ),
    },
};
