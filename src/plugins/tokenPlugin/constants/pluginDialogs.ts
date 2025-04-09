import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenDelegationDialog } from '../dialogs/tokenDelegationDialog';
import { TokenWrapFormDialogAction, TokenWrapFormDialogApprove } from '../dialogs/tokenWrapFormDialog';

export enum TokenPluginDialog {
    TOKEN_DELEGATION = ' TOKEN_DELEGATION',
    TOKEN_WRAPPING_APPROVE = ' TOKEN_WRAPPING_APPROVE',
    TOKEN_WRAPPING_ACTION = ' TOKEN_WRAPPING_ACTION',
}

export const tokenPluginDialogs: Record<TokenPluginDialog, IDialogComponentDefinitions> = {
    [TokenPluginDialog.TOKEN_DELEGATION]: { Component: TokenDelegationDialog },
    [TokenPluginDialog.TOKEN_WRAPPING_APPROVE]: { Component: TokenWrapFormDialogApprove },
    [TokenPluginDialog.TOKEN_WRAPPING_ACTION]: { Component: TokenWrapFormDialogAction },
};
