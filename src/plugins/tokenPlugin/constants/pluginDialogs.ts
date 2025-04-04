import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenDelegationFormDialog } from '../dialogs/tokenDelegationFormDialog';

export enum TokenPluginDialog {
    TOKEN_DELEGATION = ' TOKEN_DELEGATION',
}

export const tokenPluginDialogs: Record<TokenPluginDialog, IDialogComponentDefinitions> = {
    [TokenPluginDialog.TOKEN_DELEGATION]: { Component: TokenDelegationFormDialog },
};
