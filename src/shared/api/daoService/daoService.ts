import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoByEnsParams, IGetDaoParams } from './daoService.api';
import type { IDao, IDaoPlugin } from './domain';

// TODO: remove
const capitalDistributorPluginMock: IDaoPlugin = {
    address: '0x',
    subdomain: 'capital-distributor',
    release: '1',
    build: '1',
    isProcess: false,
    isBody: false,
    isSubPlugin: false,
    settings: { pluginAddress: '0x' },
    blockTimestamp: 0,
    transactionHash: '0x',
    slug: 'CAP',
    links: [{ name: 'Capital Distributor', url: 'https://example.com' }],
    name: 'Capital Distributor',
    description: 'A plugin for distributing capital',
};

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/v2/daos/:id',
        daoByEns: '/v2/daos/:network/ens/:ens',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        // TODO: remove
        if (params.urlParams.id === 'ethereum-sepolia-0x1EC71803dfD1e53188C7c446F171f9239C2DF073') {
            result.plugins.push(capitalDistributorPluginMock);
        }

        return result;
    };

    getDaoByEns = async (params: IGetDaoByEnsParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.daoByEns, params);

        return result;
    };
}

export const daoService = new DaoService();
