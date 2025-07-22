import { Network } from '@/shared/api/daoService';
import type { ISmartContractAbi } from '../../smartContractService';

export interface IAllowedAction {
    /**
     * ID of the allowed action.
     */
    id: string;
    /**
     * Network of the DAO.
     */
    network: Network;
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
     * ABI of the target contract. If not provided, the contract is assumed to be unverified.
     * Fetched as an additional data from the backend for each allowed action!
     */
    targetAbi?: ISmartContractAbi;
    /**
     * Whether the action is allowed or not. Should always be `true` for allowed actions.
     */
    isAllowed: true;
}
