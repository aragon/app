import type { IProposalActionData } from '@/modules/governance/components/createProposalForm/createProposalFormDefinitions';
import type { PrepareProposalActionMap } from '@/modules/governance/dialogs/publishProposalDialog';
import type { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';

/**
 * Reviews native DAO actions for Safe submission or an existing Safe transaction
 * for confirmation/execution. Execution readiness is rechecked onchain; pending
 * submissions resume by transaction hash without requesting another send.
 */
export interface ISafeNativeTransactionDialogParams {
    network: Network;
    safeAddress: string;
    daoAddress: string;
    actions?: IProposalActionData[];
    prepareActions?: PrepareProposalActionMap;
    transaction?: ISafeMultisigTransaction;
}

export interface ISafeNativeTransactionDialogProps
    extends IDialogComponentProps<ISafeNativeTransactionDialogParams> {}
