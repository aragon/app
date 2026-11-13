import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { PrepareProposalActionMap } from '@/modules/governance/dialogs/publishProposalDialog';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';

export interface ISafeCreateTransactionDialogParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe to create the transaction on.
     */
    safeAddress: string;
    /**
     * Actions the Safe executes, in order. More than one is batched through MultiSendCallOnly. Left out for a
     * rejection, which has none.
     */
    actions?: IProposalActionData[];
    /**
     * Nonce of the queued transaction to reject. When set, the dialog creates the rejection of that nonce instead of
     * a transaction built from `actions`.
     */
    rejectedNonce?: string;
    /**
     * Partial map of action-type and prepare-action functions, as not all actions require an async data preparation.
     */
    prepareActions?: PrepareProposalActionMap;
    /**
     * Called once the transaction is created and the dialog is left, for the caller to move on from the actions it
     * just submitted.
     */
    onCreated?: () => void;
}

export interface ISafeCreateTransactionDialogProps
    extends IDialogComponentProps<ISafeCreateTransactionDialogParams> {}
