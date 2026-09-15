import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { SafeMultisigConfirmSignatureDialog } from '../dialogs/safeMultisigConfirmSignatureDialog';
import { SafeMultisigPluginDialogId } from './safeMultisigPluginDialogId';

export const safeMultisigPluginDialogsDefinitions: Record<
    SafeMultisigPluginDialogId,
    IDialogComponentDefinitions
> = {
    [SafeMultisigPluginDialogId.CONFIRM_SIGNATURE]: {
        Component: SafeMultisigConfirmSignatureDialog,
        requiresWallet: true,
    },
};
