import type { IProposalActionData } from '@/modules/governance/components/createProposalForm/createProposalFormDefinitions';
import type { PrepareProposalActionMap } from '@/modules/governance/dialogs/publishProposalDialog';
import type { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';

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
