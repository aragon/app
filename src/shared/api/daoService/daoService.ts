import { AragonBackendService, type IPaginatedResponse } from '../aragonBackendService';
import { pluginsService } from '../pluginsService';
import type {
    IGetDaoByEnsParams,
    IGetDaoParams,
    IGetDaoPermissionsParams,
    IGetDaoPoliciesParams,
} from './daoService.api';
import type { IDao, IDaoPermission, IDaoPolicy, Network } from './domain';

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
        daoPolicies: '/v2/policies/:network/:daoAddress',
    };

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

        const { network, address } = this.parseDaoId(dao.id);
        const plugins = await pluginsService.getPluginsByDao({ urlParams: { network, address } });

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

    getDaoPolicies = async (params: IGetDaoPoliciesParams): Promise<IDaoPolicy[]> => {
        // TODO: Remove mock data when backend is ready
        return [
            {
                name: 'Capital router #1',
                description: 'This is a short description, about the gauge system',
                policyKey: 'CR1',
                address: '0x1234567890123456789012345678901234567890',
                interfaceType: 'ROUTER' as const,
                strategy: {
                    type: 'ROUTER' as const,
                },
                release: '1',
                build: '1',
                blockTimestamp: 1700000000,
                transactionHash: '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd',
            },
            {
                name: 'Capital distributor #1',
                description: 'Interface proposal are the main proposal to change any smart contracts related to the DAO\'s products.',
                policyKey: 'CD1',
                address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                interfaceType: 'CLAIMER' as const,
                strategy: {
                    type: 'CLAIMER' as const,
                },
                release: '1',
                build: '2',
                blockTimestamp: 1700100000,
                transactionHash: '0x1122334411223344112233441122334411223344112233441122334411223344',
            },
            {
                name: 'DeFi Adapter #1',
                description: 'No description',
                policyKey: 'DFA1',
                address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                interfaceType: 'ROUTER' as const,
                strategy: {
                    type: 'ROUTER' as const,
                },
                release: '1',
                build: '1',
                blockTimestamp: 1700200000,
                transactionHash: '0x3344556633445566334455663344556633445566334455663344556633445566',
            },
        ];

        // const result = await this.request<IDaoPolicy[]>(this.urls.daoPolicies, params);
        // return result;
    };
}

export const daoService = new DaoService();
