import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IDao } from '@/shared/api/daoService';
import type { IGetDaoListParams } from './daoExplorerService.api';

class DaoExplorerService extends AragonBackendService {
    private urls = {
        daos: '/daos',
    };

    getDaoList = async ({ queryParams }: IGetDaoListParams): Promise<IPaginatedResponse<IDao>> => {
        const result = await this.request<IPaginatedResponse<IDao>>(this.urls.daos, { queryParams });

        return result;
    };
}

export const daoExplorerService = new DaoExplorerService();
