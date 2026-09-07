/**
 * Raw `(to, value, data)` tuple of a nested action, as carried by the calldata of a wrapper action (e.g. `execute`,
 * `createProposal`, or a cross-chain forwarded message).
 */
export interface IRawActionTuple {
    /**
     * Target address of the action.
     */
    to: string;
    /**
     * Native value sent with the action.
     */
    value: string;
    /**
     * Calldata of the action.
     */
    data: string;
}
