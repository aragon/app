import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { Hex } from 'viem';
import type { IProposalCreate } from '../dialogs/publishProposalDialog';

export interface IBuildCreateProposalDataParams<TValues extends IProposalCreate = IProposalCreate> {
    /**
     * Metadata of the proposal in Hex format.
     */
    metadata: Hex;
    /**
     * Actions to be executed.
     */
    actions: ITransactionRequest[];
    /**
     * Form values collected on the create-proposal wizard.
     */
    values: TValues;
}
