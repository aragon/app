import type { ISmartContractAbi } from '../../api/smartContractService';

export const generateSmartContractAbi = (abi?: Partial<ISmartContractAbi>): ISmartContractAbi => ({
    name: 'smart-contract',
    implementationAddress: null,
    functions: [],
    ...abi,
});
