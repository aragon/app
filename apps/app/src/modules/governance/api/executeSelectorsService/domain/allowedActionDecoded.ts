import type { ISmartContractAbiFunctionParameter } from '../../smartContractService';

export interface IAllowedActionDecoded {
    /**
     * Name of the contract where the action is executed.
     */
    contractName: string;
    /**
     * Name of the contract function being called in the action.
     */
    functionName: string;
    /**
     * Parameters of the function.
     */
    inputs: ISmartContractAbiFunctionParameter[];
}
