import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { Hex } from 'viem';
import type { IProposalData } from '../dialogs/publishProposalDialog/publishProposalDialog';

export interface IBuildCreateProposalDataParams<TValues extends IProposalData = IProposalData> {
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
