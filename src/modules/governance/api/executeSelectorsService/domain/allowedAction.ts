import type { ISmartContractAbiFunctionParameter } from '../../smartContractService';

export interface IDecodedAction {
    /**
     * Name of the contract where the action is executed.
     */
    contractName: string;
    /**
     * Name of the proxy contract if the action is executed through a proxy.
     */
    proxyName: string;
    /**
     * Address of the implementation contract if the action is executed through a proxy.
     */
    implementationAddress: string;
    /**
     * Name of the contract function being called in the action.
     */
    functionName: string;
    /**
     * Parameters of the function.
     */
    inputs: ISmartContractAbiFunctionParameter[];
    /**
     * Notice or description of the action.
     */
    notice: string;
}

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
    decoded: IDecodedAction;
    /**
     * Whether the action is allowed or not. Should always be `true` for allowed actions.
     */
    isAllowed: true;
}
