import type { IProposalAction } from '@aragon/ods';

export interface IBuildCreateProposalDataParams {
    /**
     * Metadata of the proposal as bytes array.
     */
    metadata: Uint8Array;
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
