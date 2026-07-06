import type {
    IDecodeTransactionsLightParams,
    IGetAbiParams,
} from './smartContractService.api';

export enum SmartContractServiceKey {
    ABI = 'ABI',
    DECODE_TRANSACTIONS_LIGHT = 'DECODE_TRANSACTIONS_LIGHT',
}

export const smartContractServiceKeys = {
    abi: (params: IGetAbiParams) => [SmartContractServiceKey.ABI, params],
    decodeTransactionsLight: (params?: IDecodeTransactionsLightParams) => [
        SmartContractServiceKey.DECODE_TRANSACTIONS_LIGHT,
        params,
    ],
};
