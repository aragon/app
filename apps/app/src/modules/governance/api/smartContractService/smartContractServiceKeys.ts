import type { IGetAbiParams } from './smartContractService.api';

export enum SmartContractServiceKey {
    ABI = 'ABI',
}

export const smartContractServiceKeys = {
    abi: (params: IGetAbiParams) => [SmartContractServiceKey.ABI, params],
};
