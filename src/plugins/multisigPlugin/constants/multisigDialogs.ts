import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';

export enum MultisigDialogs {
    MULTISIG_REMOVE_MEMBERS = 'MULTISIG_REMOVE_MEMBERS',
}

export const multisigDialogs: Record<MultisigDialogs, IDialogComponentDefinitions> = {
    [MultisigDialogs.MULTISIG_REMOVE_MEMBERS]: {
        Component: TODO,
        description: 'app.plugins.multisig.addMembersDialog.description',
    },
};
