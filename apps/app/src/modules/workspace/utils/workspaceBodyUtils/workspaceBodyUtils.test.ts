import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '@/modules/workspace/api/workspaceService';
import type { IWorkspaceAccountDao } from '@/modules/workspace/hooks/useWorkspaceAccountDaos';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import {
    type IDao,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateLinkedAccount,
} from '@/shared/testUtils';
import { workspaceBodyUtils } from './workspaceBodyUtils';

// `addressUtils.isAddressEqual` validates the address format, so the fixtures use real 20-byte addresses.
const address = {
    citrea: '0x1111111111111111111111111111111111111111',
    sepolia: '0x2222222222222222222222222222222222222222',
    childRewards: '0x3333333333333333333333333333333333333333',
    childBuyback: '0x4444444444444444444444444444444444444444',
    unknownDao: '0x5555555555555555555555555555555555555555',
    tokenBody: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    process: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    multisigBody: '0xcccccccccccccccccccccccccccccccccccccccc',
    adminRewards: '0xdddddddddddddddddddddddddddddddddddddddd',
    adminBuyback: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    hiddenBody: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    sharedBody: '0x9999999999999999999999999999999999999999',
};

describe('workspaceBody utils', () => {
    const buildAccount = (dao: IDao): IWorkspaceAccount => ({
        id: dao.id,
        type: WorkspaceAccountType.DAO,
        address: dao.address,
        network: dao.network,
    });

    const buildAccountDao = (dao: IDao): IWorkspaceAccountDao => ({
        account: buildAccount(dao),
        dao,
    });

    describe('getBodyPlugins', () => {
        it('returns only bodies, across every account', () => {
            const citrea = generateDao({
                id: `${Network.CITREA_MAINNET}-${address.citrea}`,
                address: address.citrea,
                network: Network.CITREA_MAINNET,
                name: 'Citrea',
                plugins: [
                    generateDaoPlugin({
                        address: address.tokenBody,
                        name: 'xCTR',
                        isBody: true,
                        daoAddress: address.citrea,
                        interfaceType: PluginInterfaceType.TOKEN_VOTING,
                    }),
                    generateDaoPlugin({
                        address: address.process,
                        name: 'Core Governance',
                        isProcess: true,
                        daoAddress: address.citrea,
                        interfaceType: PluginInterfaceType.SPP,
                    }),
                ],
            });
            const sepolia = generateDao({
                id: `${Network.ETHEREUM_SEPOLIA}-${address.sepolia}`,
                address: address.sepolia,
                network: Network.ETHEREUM_SEPOLIA,
                name: 'Capital Flow',
                plugins: [
                    generateDaoPlugin({
                        address: address.multisigBody,
                        name: 'Multisig',
                        isBody: true,
                        daoAddress: address.sepolia,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                ],
            });

            const result = workspaceBodyUtils.getBodyPlugins({
                accountDaos: [
                    buildAccountDao(citrea),
                    buildAccountDao(sepolia),
                ],
            });

            expect(result.map((body) => body.meta.address)).toEqual([
                address.tokenBody,
                address.multisigBody,
            ]);
        });

        it('qualifies the label with the DAO that owns the body, so same-named bodies stay distinguishable', () => {
            const dao = generateDao({
                id: `${Network.ETHEREUM_SEPOLIA}-${address.sepolia}`,
                address: address.sepolia,
                network: Network.ETHEREUM_SEPOLIA,
                name: 'Capital Flow',
                linkedAccounts: [
                    generateLinkedAccount({
                        id: `${Network.ETHEREUM_SEPOLIA}-${address.childRewards}`,
                        address: address.childRewards,
                        network: Network.ETHEREUM_SEPOLIA,
                        name: 'Rewards SubDAO',
                    }),
                    generateLinkedAccount({
                        id: `${Network.ETHEREUM_SEPOLIA}-${address.childBuyback}`,
                        address: address.childBuyback,
                        network: Network.ETHEREUM_SEPOLIA,
                        name: 'Buyback SubDAO',
                    }),
                ],
                plugins: [
                    generateDaoPlugin({
                        address: address.adminRewards,
                        subdomain: 'admin',
                        isBody: true,
                        daoAddress: address.childRewards,
                        interfaceType: PluginInterfaceType.ADMIN,
                    }),
                    generateDaoPlugin({
                        address: address.adminBuyback,
                        subdomain: 'admin',
                        isBody: true,
                        daoAddress: address.childBuyback,
                        interfaceType: PluginInterfaceType.ADMIN,
                    }),
                ],
            });

            const result = workspaceBodyUtils.getBodyPlugins({
                accountDaos: [buildAccountDao(dao)],
            });

            expect(result.map((body) => body.label)).toEqual([
                'Rewards SubDAO · Admin',
                'Buyback SubDAO · Admin',
            ]);
        });

        it('scopes a body to the DAO that owns it, not to the workspace account', () => {
            const dao = generateDao({
                id: `${Network.ETHEREUM_SEPOLIA}-${address.sepolia}`,
                address: address.sepolia,
                network: Network.ETHEREUM_SEPOLIA,
                linkedAccounts: [
                    generateLinkedAccount({
                        id: `${Network.ETHEREUM_SEPOLIA}-${address.childRewards}`,
                        address: address.childRewards,
                        network: Network.ETHEREUM_SEPOLIA,
                        name: 'Rewards SubDAO',
                    }),
                ],
                plugins: [
                    generateDaoPlugin({
                        address: address.multisigBody,
                        isBody: true,
                        daoAddress: address.childRewards,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                ],
            });

            const [body] = workspaceBodyUtils.getBodyPlugins({
                accountDaos: [buildAccountDao(dao)],
            });

            expect(body.daoId).toEqual(
                `${Network.ETHEREUM_SEPOLIA}-${address.childRewards}`,
            );
            expect(body.accountDaoId).toEqual(
                `${Network.ETHEREUM_SEPOLIA}-${address.sepolia}`,
            );
        });

        it('keeps a body whose target is neither the account nor a known linked account', () => {
            const dao = generateDao({
                id: `${Network.ETHEREUM_SEPOLIA}-${address.sepolia}`,
                address: address.sepolia,
                network: Network.ETHEREUM_SEPOLIA,
                plugins: [
                    generateDaoPlugin({
                        address: address.multisigBody,
                        subdomain: 'multisig',
                        isBody: true,
                        daoAddress: address.unknownDao,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                ],
            });

            const [body] = workspaceBodyUtils.getBodyPlugins({
                accountDaos: [buildAccountDao(dao)],
            });

            expect(body.daoId).toEqual(
                `${Network.ETHEREUM_SEPOLIA}-${address.unknownDao}`,
            );
            expect(body.label).toEqual('0x5555…5555 · Multisig');
        });

        it('drops bodies hidden by the CMS override of their account, case-insensitively', () => {
            const dao = generateDao({
                id: `${Network.CITREA_MAINNET}-${address.citrea}`,
                address: address.citrea,
                network: Network.CITREA_MAINNET,
                plugins: [
                    generateDaoPlugin({
                        address: address.multisigBody,
                        isBody: true,
                        daoAddress: address.citrea,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                    generateDaoPlugin({
                        address: address.hiddenBody,
                        isBody: true,
                        daoAddress: address.citrea,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                ],
            });

            const result = workspaceBodyUtils.getBodyPlugins({
                accountDaos: [buildAccountDao(dao)],
                daoOverrides: {
                    [`${Network.CITREA_MAINNET}-${address.citrea}`]: {
                        pluginsToHide: [
                            { address: address.hiddenBody.toLowerCase() },
                        ],
                    },
                },
            });

            expect(result.map((body) => body.meta.address)).toEqual([
                address.multisigBody,
            ]);
        });

        it('keeps the interface type as the option id so plugin member lists still resolve', () => {
            const dao = generateDao({
                id: `${Network.CITREA_MAINNET}-${address.citrea}`,
                address: address.citrea,
                network: Network.CITREA_MAINNET,
                plugins: [
                    generateDaoPlugin({
                        address: address.tokenBody,
                        isBody: true,
                        daoAddress: address.citrea,
                        interfaceType: PluginInterfaceType.TOKEN_VOTING,
                    }),
                ],
            });

            const [body] = workspaceBodyUtils.getBodyPlugins({
                accountDaos: [buildAccountDao(dao)],
            });

            expect(body.id).toEqual(PluginInterfaceType.TOKEN_VOTING);
        });

        it('builds ids that stay unique when two chains reuse a plugin address', () => {
            const first = generateDao({
                id: `${Network.CITREA_MAINNET}-${address.citrea}`,
                address: address.citrea,
                network: Network.CITREA_MAINNET,
                plugins: [
                    generateDaoPlugin({
                        address: address.sharedBody,
                        isBody: true,
                        daoAddress: address.citrea,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                ],
            });
            const second = generateDao({
                id: `${Network.ETHEREUM_SEPOLIA}-${address.sepolia}`,
                address: address.sepolia,
                network: Network.ETHEREUM_SEPOLIA,
                plugins: [
                    generateDaoPlugin({
                        address: address.sharedBody,
                        isBody: true,
                        daoAddress: address.sepolia,
                        interfaceType: PluginInterfaceType.MULTISIG,
                    }),
                ],
            });

            const result = workspaceBodyUtils.getBodyPlugins({
                accountDaos: [buildAccountDao(first), buildAccountDao(second)],
            });

            const ids = result.map((body) => body.uniqueId);
            expect(ids).toHaveLength(2);
            expect(new Set(ids).size).toEqual(2);
        });

        it('skips accounts whose DAO has not resolved yet', () => {
            const dao = generateDao({
                id: `${Network.ETHEREUM_SEPOLIA}-${address.sepolia}`,
                address: address.sepolia,
                network: Network.ETHEREUM_SEPOLIA,
            });

            const result = workspaceBodyUtils.getBodyPlugins({
                accountDaos: [{ account: buildAccount(dao) }],
            });

            expect(result).toEqual([]);
        });
    });

    describe('getFeaturedDelegates', () => {
        const dao = generateDao({
            id: `${Network.CITREA_MAINNET}-${address.citrea}`,
            address: address.citrea,
            network: Network.CITREA_MAINNET,
            name: 'Citrea',
            plugins: [
                generateDaoPlugin({
                    address: address.tokenBody,
                    name: 'xCTR',
                    isBody: true,
                    daoAddress: address.citrea,
                    interfaceType: PluginInterfaceType.TOKEN_VOTING,
                }),
                generateDaoPlugin({
                    address: address.multisigBody,
                    isBody: true,
                    daoAddress: address.citrea,
                    interfaceType: PluginInterfaceType.MULTISIG,
                }),
            ],
        });

        const config: IFeaturedDelegates = {
            daoAddress: address.citrea,
            network: Network.CITREA_MAINNET,
            pluginAddress: address.tokenBody,
            delegates: ['0x1576970ec7CDAFAf0226712C422Be1537fFcf63F'],
        };

        const getResult = (featuredDelegates: IFeaturedDelegates[]) => {
            const accountDaos = [buildAccountDao(dao)];
            const bodyPlugins = workspaceBodyUtils.getBodyPlugins({
                accountDaos,
            });

            return workspaceBodyUtils.getFeaturedDelegates({
                accountDaos,
                bodyPlugins,
                featuredDelegates,
            });
        };

        it('matches a config to the token voting body it points at', () => {
            const result = getResult([config]);

            expect(result).toHaveLength(1);
            expect(result[0].plugin.address).toEqual(address.tokenBody);
            expect(result[0].daoName).toEqual('Citrea');
        });

        it('ignores a config with no delegates', () => {
            expect(getResult([{ ...config, delegates: [] }])).toEqual([]);
        });

        it('ignores a config for a DAO on another network', () => {
            expect(
                getResult([{ ...config, network: Network.ETHEREUM_MAINNET }]),
            ).toEqual([]);
        });

        it('ignores a config pointing at a body that is not token voting', () => {
            expect(
                getResult([{ ...config, pluginAddress: address.multisigBody }]),
            ).toEqual([]);
        });

        it('ignores a config pointing at an unknown plugin', () => {
            expect(
                getResult([{ ...config, pluginAddress: address.sharedBody }]),
            ).toEqual([]);
        });
    });
});
