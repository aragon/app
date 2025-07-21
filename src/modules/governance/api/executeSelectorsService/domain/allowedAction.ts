export interface IAllowedAction {
    /**
     * ID of the allowed action.
     */
    id: string;
    /**
     * Network of the DAO.
     */
    network: string;
    /**
     * Address of the DAO to which the process belongs.
     */
    daoAddress: string;
    /**
     * Address of the process plugin that defines the action.
     */
    pluginAddress: string;
    /**
     * Address of the condition contract that allows the action.
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
     * Whether the action is allowed or not. Should always be `true` for allowed actions.
     */
    isAllowed: true;
}
