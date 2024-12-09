import type { IProposalAction as IGukProposalAction } from '@aragon/gov-ui-kit';

export interface IProposalAction extends Omit<IGukProposalAction, 'type'> {
    /**
     * Type of the proposal action.
     */
    type: string;
}
