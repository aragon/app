import type { ISmartContractAbiFunction } from './smartContractAbiFunction';

export interface ISmartContractAbi {
    /**
     * Name of the smart contract.
     */
    name: string;
    /**
     * Address of the smart contract implementation, set when the smart contract is a proxy.
     */
    implementationAddress: string | null;
    /**
     * Functions of the smart contract.
     */
    functions: ISmartContractAbiFunction[];
}
