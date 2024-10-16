import type { Hex } from 'viem';
import type { IProposalAction } from '../api/governanceService';
import type { ICreateProposalFormData } from '../components/createProposalForm';

export interface IBuildCreateProposalDataParams<TValues extends ICreateProposalFormData = ICreateProposalFormData> {
    /**
     * Metadata of the proposal in Hex format.
     */
    metadata: Hex;
    /**
     * Actions to be executed.
     */
    actions: Array<Pick<IProposalAction, 'to' | 'value' | 'data'>>;
    /**
     * Form values collected on the create-proposal wizard.
     */
    values: TValues;
}
