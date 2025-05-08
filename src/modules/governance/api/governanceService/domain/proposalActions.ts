import type { IProposalAction } from "./proposalAction";

export interface IRawAction {
    /**
     * The address of the contract to call.
     */
    to: string;
    /**
     * The value to send with the transaction.
     */
    value: string;
    /**
     * The raw calldata payload.
     */
    data: string;
}

export interface IProposalActions<TAction extends IProposalAction = IProposalAction> {
    /**
     * Are the actions being decoded?
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
