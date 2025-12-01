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
                name: 'Capital Router 1 name',
                description: 'Capital Router 1 description',
                links: [
                    {
                        name: 'Documentation',
                        url: 'https://example.com/docs/policy',
                    },
                ],
                policyKey: 'CR1',
                address: '0x1234567890123456789012345678901234567890',
                daoAddress: '0x0987654321098765432109876543210987654321',
                interfaceType: 'ROUTER' as const,
                strategy: {
                    type: 'ROUTER' as const,
                    model: {
                        type: 'RATIO' as const,
                        address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
                        recipients: [
                            '0x1111111111111111111111111111111111111111',
                            '0x2222222222222222222222222222222222222222',
                            '0x3333333333333333333333333333333333333333',
                        ],
                        ratios: [50, 30, 20],
                    },
                    source: {
                        type: 'DRAIN' as const,
                        address: '0x4444444444444444444444444444444444444444',
                        vaultAddress: '0x5555555555555555555555555555555555555555',
                        token: {
                            address: '0x6666666666666666666666666666666666666666',
                            name: 'USD Coin',
                            symbol: 'USDC',
                            decimals: 6,
                            logoURI: 'https://example.com/usdc-logo.png',
                        },
                    },
                },
                release: '1',
                build: '1',
                blockTimestamp: 1700000000,
                transactionHash: '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd',
                metadataIpfs: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX',
            },
            {
                name: 'Gauge-Based Routing Policy',
                description: 'Distributes funds based on gauge voting results',
                links: [],
                policyKey: 'GR',
                address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                daoAddress: '0x0987654321098765432109876543210987654321',
                interfaceType: 'ROUTER' as const,
                strategy: {
                    type: 'ROUTER' as const,
                    model: {
                        type: 'GAUGE_RATIO' as const,
                        address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                        gaugeVoterAddress: '0xcccccccccccccccccccccccccccccccccccccccc',
                    },
                    source: {
                        type: 'STREAM_BALANCE' as const,
                        address: '0xdddddddddddddddddddddddddddddddddddddddd',
                        vaultAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                        token: {
                            address: '0xffffffffffffffffffffffffffffffffffffffff',
                            name: 'Wrapped Ether',
                            symbol: 'WETH',
                            decimals: 18,
                            logoURI: 'https://example.com/weth-logo.png',
                        },
                        amountPerEpoch: BigInt('1000000000000000000'),
                        maxSourceBalance: BigInt('10000000000000000000'),
                        epochInterval: 86400,
                    },
                },
                release: '1',
                build: '2',
                blockTimestamp: 1700100000,
                transactionHash: '0x1122334411223344112233441122334411223344112233441122334411223344',
                metadataIpfs: 'QmYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyY',
            },
            {
                name: 'Capital Distributor 1 name',
                description: 'Capital Distributor 1 description',
                links: [
                    {
                        name: 'Documentation',
                        url: 'https://example.com/docs/policy',
                    },
                ],
                policyKey: 'CD1',
                address: '0x1234567890123456789012345678901234567890',
                daoAddress: '0x0987654321098765432109876543210987654321',
                interfaceType: 'CLAIMER' as const,
                strategy: {
                    type: 'CLAIMER' as const,
                    model: {
                        type: 'RATIO' as const,
                        address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
                        recipients: [
                            '0x1111111111111111111111111111111111111111',
                            '0x2222222222222222222222222222222222222222',
                            '0x3333333333333333333333333333333333333333',
                        ],
                        ratios: [50, 30, 20],
                    },
                    source: {
                        type: 'STREAM_BALANCE' as const,
                        address: '0x4444444444444444444444444444444444444444',
                        vaultAddress: '0x5555555555555555555555555555555555555555',
                        token: {
                            address: '0x6666666666666666666666666666666666666666',
                            name: 'USD Coin',
                            symbol: 'USDC',
                            decimals: 6,
                            logoURI: 'https://example.com/usdc-logo.png',
                        },
                        amountPerEpoch: BigInt('500000000'),
                        maxSourceBalance: BigInt('5000000000'),
                        epochInterval: 604800,
                    },
                },
                release: '1',
                build: '1',
                blockTimestamp: 1700000000,
                transactionHash: '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd',
                metadataIpfs: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX',
            },
        ];

        // const result = await this.request<IDaoPolicy[]>(this.urls.daoPolicies, params);
        // return result;
    };
}

export const daoService = new DaoService();
