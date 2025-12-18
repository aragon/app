import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IDao } from '@/shared/api/daoService';
import type { IGetDaoListByMemberAddressParams, IGetDaoListParams } from './daoExplorerService.api';

class DaoExplorerService extends AragonBackendService {
    private readonly urls = {
        daos: '/v2/daos',
        daoListByMemberAddress: '/v2/daos/member/:address',
    };

    getDaoList = async ({ queryParams }: IGetDaoListParams): Promise<IPaginatedResponse<IDao>> => {
        const result = await this.request<IPaginatedResponse<IDao>>(this.urls.daos, { queryParams });

        return result;
    };

    getDaoListByMemberAddress = async (params: IGetDaoListByMemberAddressParams): Promise<IPaginatedResponse<IDao>> => {
        const result = await this.request<IPaginatedResponse<IDao>>(this.urls.daoListByMemberAddress, params);

        return result;
    };
}

export const daoExplorerService = new DaoExplorerService();
