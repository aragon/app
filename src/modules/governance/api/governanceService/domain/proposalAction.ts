import type { IProposalAction as IOdsProposalAction } from '@aragon/ods';
import type { ProposalActionType } from './enum';

export interface IProposalAction extends Omit<IOdsProposalAction, 'type'> {
    /**
     * Type of the proposal action.
     */
    type: ProposalActionType;
}
