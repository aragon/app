import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { IProposalAction } from '../governanceService';
import type { ISmartContractAbi } from './domain';
import type { IDecodeTransactionParams, IGetAbiParams } from './smartContractService.api';

class SmartContractService extends AragonBackendService {
    private urls = {
        abi: '/v1/contract/:network/:address',
        decodeTransaction: '/v1/contract/:network/:address/decode',
    };

    getAbi = async (params: IGetAbiParams): Promise<ISmartContractAbi | undefined> => {
        const result = await this.request<ISmartContractAbi | undefined>(this.urls.abi, params);

        return result;
    };

    decodeTransaction = async (params: IDecodeTransactionParams): Promise<IProposalAction> => {
        const result = await this.request<IProposalAction>(this.urls.decodeTransaction, params, { method: 'POST' });

        return result;
    };
}

export const smartContractService = new SmartContractService();
