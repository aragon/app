import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IDao, IGetDaoListByMemberAddressParams } from '@/shared/api/daoService';
import type { IGetDaoListParams } from './daoExplorerService.api';

class DaoExplorerService extends AragonBackendService {
    private urls = {
        daos: '/daos',
        daoListByMemberAddress: '/daos/member/:address',
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
