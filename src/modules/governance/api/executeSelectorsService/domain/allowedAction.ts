import type { IAllowedActionDecoded } from './allowedActionDecoded';

export interface IAllowedAction {
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
    decoded: IAllowedActionDecoded;
    /**
     * Whether the action is allowed or not. Should always be `true` for allowed actions.
     */
    isAllowed: true;
}
