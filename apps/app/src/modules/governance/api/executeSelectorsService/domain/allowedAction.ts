import type { IAllowedActionDecoded } from './allowedActionDecoded';

export interface IAllowedAction {
    /**
     * Unique backend identifier of the allowed-action event.
     */
    id: string;
    /**
     * Address of the condition contract that gates this action.
     */
    conditionAddress: string;
    /**
     * Selector of the allowed action. `null` means native transfer.
     */
    selector: string | null;
    /**
     * Address of the contract being called (`where`).
     */
    target: string;
    /**
     * Decoded action data.
     * Contains information about the action, such as function name, parameters, etc.
     */
    decoded?: IAllowedActionDecoded;
    /**
     * Whether the action is allowed or not. Should always be `true` for allowed actions.
     */
    isAllowed: true;
    /**
     * Chain ID for which given allowed action is relevant. In general, value
     * should be back-filled, but if not set, consider it as a chain id of the DAO.
     */
    chainId?: number;
}
