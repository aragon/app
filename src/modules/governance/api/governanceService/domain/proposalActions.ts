import type { IProposalAction } from './proposalAction';

export interface IRawAction {
    /**
     * The address of the contract.
     */
    to: string;
    /**
     * The value sent with the transaction.
     */
    value: string;
    /**
     * The raw calldata payload.
     */
    data: string;
}

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
    rawActions: IRawAction[];
}
