import type { IProposalAction } from './proposalAction';

export interface IProposalActionsResult<TAction extends IProposalAction = IProposalAction> {
    /**
     * Flag indicating if the actions are being decoded.
     */
    decoding: boolean;
    /**
     * The decoded actions.
     */
    actions: TAction[];
    /**
     * The raw actions.
     */
    rawActions?: Array<Pick<IProposalAction, 'to' | 'value' | 'data'>>;
}
