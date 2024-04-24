import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IDao } from '@/shared/api/daoService/domain';
import type { IGetDaoListParams } from './daoExplorerService.api';

class DaoExplorerService extends AragonBackendService {
    private urls = {
        daoList: '/dao',
    };

    getDaoList = ({ queryParams }: IGetDaoListParams): Promise<IPaginatedResponse<IDao>> => {
        const result = this.request<IPaginatedResponse<IDao>>(this.urls.daoList, { queryParams });

        return result;
    };
}

export const daoExplorerService = new DaoExplorerService();
