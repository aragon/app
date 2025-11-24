import { AragonBackendService, type IPaginatedResponse } from '../aragonBackendService';
import { pluginsService } from '../pluginsService';
import type { IGetDaoByEnsParams, IGetDaoParams, IGetDaoPermissionsParams } from './daoService.api';
import type { IDao, IDaoPermission, Network } from './domain';

/**
 * DAO response from API where plugins may be missing or empty.
 */
type IDaoApiResponse = Omit<IDao, 'plugins'> & {
    plugins?: IDao['plugins'];
};

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/v2/daos/:id',
        daoByEns: '/v2/daos/:network/ens/:ens',
        daoPermissions: '/v2/permissions/:network/:daoAddress',
    };

    /**
     * Parse a DAO id (e.g. "polygon-mainnet-0x...") into network and address.
     * This is a local helper to avoid importing daoUtils and creating cycles.
     */
    private parseDaoId = (daoId: string): { network: Network; address: string } => {
        const lastDash = daoId.lastIndexOf('-');
        const network = daoId.substring(0, lastDash) as Network;
        const address = daoId.substring(lastDash + 1);

        return { network, address };
    };

    /**
     * Ensure the returned DAO always has its plugins populated.
     * Old backends already include plugins on the DAO endpoint; new ones
     * require an extra call to the plugins-by-dao endpoint.
     */
    private withPlugins = async (dao: IDaoApiResponse): Promise<IDao> => {
        if (dao.plugins != null && dao.plugins.length > 0) {
            return dao as IDao;
        }

        const { network, address } = this.parseDaoId(dao.id);
        const plugins = await pluginsService.getDaoPluginsByDao({ urlParams: { network, address } });

        return { ...dao, plugins };
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDaoApiResponse>(this.urls.dao, params);

        return this.withPlugins(result);
    };

    getDaoByEns = async (params: IGetDaoByEnsParams): Promise<IDao> => {
        const result = await this.request<IDaoApiResponse>(this.urls.daoByEns, params);

        return this.withPlugins(result);
    };

    getDaoPermissions = async (params: IGetDaoPermissionsParams): Promise<IPaginatedResponse<IDaoPermission>> => {
        const result = await this.request<IPaginatedResponse<IDaoPermission>>(this.urls.daoPermissions, params);

        return result;
    };
}

export const daoService = new DaoService();
