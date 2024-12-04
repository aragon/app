import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { ISmartContractAbi } from './domain';
import type { IGetAbiParams } from './smartContractService.api';

class SmartContractService extends AragonBackendService {
    private urls = {
        abi: '/contract/:network/:address',
    };

    getAbi = async (params: IGetAbiParams): Promise<ISmartContractAbi> => {
        const result = await this.request<ISmartContractAbi>(this.urls.abi, params);

        return result;
    };
}

export const smartContractService = new SmartContractService();
