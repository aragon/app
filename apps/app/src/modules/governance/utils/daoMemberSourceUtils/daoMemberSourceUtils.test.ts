import {
    type IDaoPlugin,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateLinkedAccount,
} from '@/shared/testUtils';
import { daoMemberSourceUtils } from './daoMemberSourceUtils';

describe('daoMemberSourceUtils', () => {
    const rootDaoAddress = '0x1111111111111111111111111111111111111111';
    const linkedDaoAddress = '0x2222222222222222222222222222222222222222';
    const daoId = `${Network.ETHEREUM_MAINNET}-${rootDaoAddress}`;

    const createDao = () =>
        generateDao({
            address: rootDaoAddress,
            network: Network.ETHEREUM_MAINNET,
            linkedAccounts: [
                generateLinkedAccount({ address: linkedDaoAddress }),
            ],
        });

    const resolve = (bodyPlugins: IDaoPlugin[]) =>
        daoMemberSourceUtils.resolve({
            dao: createDao(),
            daoId,
            bodyPlugins,
        });

    // The member list is queried against the DAO that owns the body. A Safe shared by two linked
    // DAOs would otherwise read members from whichever DAO the page was opened on.
    it('scopes a linked-account body to the DAO that owns it', () => {
        const safeAddress = '0x3333333333333333333333333333333333333333';
        const [source] = resolve([
            generateDaoPlugin({
                address: safeAddress,
                daoAddress: linkedDaoAddress,
                interfaceType: PluginInterfaceType.SAFE,
                isBody: true,
                slug: 'safe',
            }),
        ]);

        expect(source.daoId).toEqual(
            `${Network.ETHEREUM_MAINNET}-${linkedDaoAddress}`,
        );
        expect(source.address).toEqual(safeAddress);
    });

    it('keeps a root-DAO body on the viewed DAO', () => {
        const [source] = resolve([
            generateDaoPlugin({
                daoAddress: rootDaoAddress,
                interfaceType: PluginInterfaceType.MULTISIG,
                isBody: true,
                slug: 'multisig',
            }),
        ]);

        expect(source.daoId).toEqual(daoId);
    });

    // The tab id travels in the `members` URL parameter, so it has to stay stable across renders
    // and match what useDaoPlugins builds for the same plugin.
    it('identifies a source by its plugin address and slug', () => {
        const address = '0x4444444444444444444444444444444444444444';
        const [source] = resolve([
            generateDaoPlugin({
                address,
                daoAddress: rootDaoAddress,
                interfaceType: PluginInterfaceType.SAFE,
                isBody: true,
                slug: 'safe',
            }),
        ]);

        expect(source.uniqueId).toEqual(`${address}-safe-${rootDaoAddress}`);
        expect(source.id).toEqual(PluginInterfaceType.SAFE);
    });

    // Two linked DAOs can hold the same Safe contract; they are separate tabs.
    it('keeps separate tabs for one Safe shared by two linked DAOs', () => {
        const safeAddress = '0x7777777777777777777777777777777777777777';
        const sources = resolve([
            generateDaoPlugin({
                address: safeAddress,
                daoAddress: rootDaoAddress,
                interfaceType: PluginInterfaceType.SAFE,
                isBody: true,
                slug: 'safe',
            }),
            generateDaoPlugin({
                address: safeAddress,
                daoAddress: linkedDaoAddress,
                interfaceType: PluginInterfaceType.SAFE,
                isBody: true,
                slug: 'safe',
            }),
        ]);

        expect(sources.map(({ uniqueId }) => uniqueId)).toEqual([
            `${safeAddress}-safe-${rootDaoAddress}`,
            `${safeAddress}-safe-${linkedDaoAddress}`,
        ]);
        expect(sources[0].daoId).toEqual(daoId);
        expect(sources[1].daoId).toEqual(
            `${Network.ETHEREUM_MAINNET}-${linkedDaoAddress}`,
        );
    });

    it('orders root-DAO bodies before linked-account bodies', () => {
        const sources = resolve([
            generateDaoPlugin({
                address: '0x5555555555555555555555555555555555555555',
                daoAddress: linkedDaoAddress,
                interfaceType: PluginInterfaceType.MULTISIG,
                isBody: true,
                slug: 'linked-multisig',
            }),
            generateDaoPlugin({
                address: '0x6666666666666666666666666666666666666666',
                daoAddress: rootDaoAddress,
                interfaceType: PluginInterfaceType.MULTISIG,
                isBody: true,
                slug: 'root-multisig',
            }),
        ]);

        expect(sources.map(({ uniqueId }) => uniqueId)).toEqual([
            '0x6666666666666666666666666666666666666666-root-multisig',
            '0x5555555555555555555555555555555555555555-linked-multisig',
        ]);
    });
});
