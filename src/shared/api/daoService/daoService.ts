import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { AragonBackendService, type IPaginatedResponse } from '../aragonBackendService';
import { pluginsService } from '../pluginsService';
import type { IGetDaoByEnsParams, IGetDaoParams, IGetDaoPermissionsParams, IGetDaoPoliciesParams } from './daoService.api';
import type { IDao, IDaoPermission, IDaoPolicy, Network } from './domain';

/**
 * DAO response from API where plugins may be missing or empty.
 */
type IDaoApiResponse = Omit<IDao, 'plugins'> & {
    plugins?: IDao['plugins'];
};

class DaoService extends AragonBackendService {
    // Base paths without version prefix
    private basePaths = {
        dao: '/daos/:id',
        daoByEns: '/daos/:network/ens/:ens',
        daoPermissions: '/permissions/:network/:daoAddress',
        daoPolicies: '/policies/:network/:daoAddress',
    };

    // Build URLs dynamically based on environment
    private get urls() {
        return {
            // Use environment version (v3 in dev/staging, v2 in production)
            dao: apiVersionUtils.buildVersionedUrl(this.basePaths.dao),
            daoByEns: apiVersionUtils.buildVersionedUrl(this.basePaths.daoByEns),
            // Force v2 for permissions (not available in v3 yet)
            daoPermissions: apiVersionUtils.buildVersionedUrl(this.basePaths.daoPermissions, { forceVersion: 'v2' }),
            daoPolicies: apiVersionUtils.buildVersionedUrl(this.basePaths.daoPolicies, { forceVersion: 'v2' }),
        };
    }

    /**
     * Parse a DAO id (e.g. "polygon-mainnet-0x...") into network and address.
     * This is a local helper to avoid importing daoUtils and creating cycles.
     * Refactor this in https://linear.app/aragon/issue/APP-364
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

        try {
            const { network, address } = this.parseDaoId(dao.id);
            const plugins = await pluginsService.getPluginsByDao({ urlParams: { network, address } });

            return { ...dao, plugins };
        } catch (error) {
            monitoringUtils.logError(error);
            return dao as IDao;
        }
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

    getDaoPolicies = async (params: IGetDaoPoliciesParams): Promise<IDaoPolicy[]> => {
        const result = await this.request<IDaoPolicy[]>(this.urls.daoPolicies, params);
        return result;
    };
}

export const daoService = new DaoService();
