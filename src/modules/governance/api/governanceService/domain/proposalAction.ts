import type { IProposalAction as IGukProposalAction } from '@aragon/gov-ui-kit';
import type { ProposalActionType } from './enum';

export interface IProposalAction extends Omit<IGukProposalAction, 'type'> {
    /**
     * Type of the proposal action.
     */
    type: ProposalActionType;
}
