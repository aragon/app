import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenDelegationFormDialog } from '../dialogs/tokenDelegationFormDialog';

export enum TokenPluginDialog {
    TOKEN_DELEGATION = ' TOKEN_DELEGATION',
    TOKEN_WRAPPING = ' TOKEN_WRAPPING',
}

export const tokenPluginDialogs: Record<TokenPluginDialog, IDialogComponentDefinitions> = {
    [TokenPluginDialog.TOKEN_DELEGATION]: { Component: TokenDelegationFormDialog },
    [TokenPluginDialog.TOKEN_WRAPPING]: { Component: TokenDelegationFormDialog },
};
