import type { IProposalAction as IGukProposalAction } from '@aragon/gov-ui-kit';
import type { ProposalActionType } from './enum';

export interface IProposalAction<TType = ProposalActionType> extends Omit<IGukProposalAction, 'type'> {
    /**
     * Type of the proposal action.
     */
    type: TType;
}
