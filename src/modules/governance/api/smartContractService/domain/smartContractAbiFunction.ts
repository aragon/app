import type { ISmartContractAbiFunctionParameter } from './smartContractAbiFunctionParameter';

export interface ISmartContractAbiFunction {
    /**
     * Name of the function.
     */
    name: string;
    /**
     * NatSpec comment for the function.
     */
    notice?: string;
    /**
     * State mutability of the function.
     */
    stateMutability?: string;
    /**
     * Parameters of the function.
     */
    parameters: ISmartContractAbiFunctionParameter[];
}
