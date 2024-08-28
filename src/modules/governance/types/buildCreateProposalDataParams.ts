import type { IProposalAction } from '@aragon/ods';
import type { Hex } from 'viem';

export interface IBuildCreateProposalDataParams {
    /**
     * Metadata of the proposal in Hex format.
     */
    metadata: Hex;
    /**
     * Actions to be executed.
     */
    actions: Array<Pick<IProposalAction, 'to' | 'value' | 'data'>>;
    /**
     * Start date of the proposal in seconds.
     */
    startDate: number;
    /**
     * End date of the proposal in seconds.
     */
    endDate: number;
}
