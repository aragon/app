import { Network } from '@/shared/api/daoService';
import type { ISmartContractAbiFunction } from './smartContractAbiFunction';

export interface ISmartContractAbi {
    /**
     * Name of the smart contract.
     */
    name: string;
    /**
     * Address of the smart contract.
     */
    address: string;
    /**
     * Network of the smart contract.
     */
    network: Network;
    /**
     * Address of the smart contract implementation, only set when the smart contract is a proxy.
     */
    implementationAddress: string | null;
    /**
     * Functions of the smart contract.
     */
    functions: ISmartContractAbiFunction[];
}
