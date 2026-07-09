import { type IDaoPlugin, PluginInterfaceType } from '@/shared/api/daoService';
import { generateDaoPlugin } from '@/shared/testUtils';
import { pluginSortUtils } from './pluginSortUtils';

const ROOT_DAO_ADDRESS = '0xRoot';

const buildFilterPlugin = (plugin: Partial<IDaoPlugin>) => ({
    id: plugin.interfaceType ?? PluginInterfaceType.UNKNOWN,
    uniqueId: `${plugin.address ?? '0x0'}-${plugin.slug ?? 'slug'}`,
    label: '',
    meta: generateDaoPlugin(plugin),
    props: {},
});

describe('pluginSortUtils.sortByDisplayOrder', () => {
    it('treats sub-plugins on the root DAO as root-level for sorting purposes', () => {
        const standalone = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: false,
        });
        const sub = buildFilterPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: true,
        });

        const sorted = pluginSortUtils.sortByDisplayOrder([standalone, sub], {
            rootDaoAddress: ROOT_DAO_ADDRESS,
        });
        expect(sorted.map((p) => p.meta.interfaceType)).toEqual([
            PluginInterfaceType.TOKEN_VOTING,
            PluginInterfaceType.MULTISIG,
        ]);
    });

    it('sorts root-DAO plugins before linked-account plugins of the same type', () => {
        const root = buildFilterPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: false,
        });
        const linked = buildFilterPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            daoAddress: '0xLinkedDao',
            isSubPlugin: false,
        });

        const sorted = pluginSortUtils.sortByDisplayOrder([linked, root], {
            rootDaoAddress: ROOT_DAO_ADDRESS,
        });
        expect(sorted).toEqual([root, linked]);
    });

    it('sorts by interface type priority: TOKEN_VOTING > MULTISIG > LOCK_TO_VOTE', () => {
        const lock = buildFilterPlugin({
            interfaceType: PluginInterfaceType.LOCK_TO_VOTE,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x3',
        });
        const multisig = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x2',
        });
        const token = buildFilterPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x1',
        });

        const sorted = pluginSortUtils.sortByDisplayOrder(
            [lock, multisig, token],
            { rootDaoAddress: ROOT_DAO_ADDRESS },
        );
        expect(sorted.map((p) => p.meta.interfaceType)).toEqual([
            PluginInterfaceType.TOKEN_VOTING,
            PluginInterfaceType.MULTISIG,
            PluginInterfaceType.LOCK_TO_VOTE,
        ]);
    });

    it('sorts unknown/other interface types after listed types with priority 99', () => {
        const admin = buildFilterPlugin({
            interfaceType: PluginInterfaceType.ADMIN,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x1',
        });
        const lockToVote = buildFilterPlugin({
            interfaceType: PluginInterfaceType.LOCK_TO_VOTE,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x2',
        });

        const sorted = pluginSortUtils.sortByDisplayOrder([admin, lockToVote], {
            rootDaoAddress: ROOT_DAO_ADDRESS,
        });
        expect(sorted.map((p) => p.meta.interfaceType)).toEqual([
            PluginInterfaceType.LOCK_TO_VOTE,
            PluginInterfaceType.ADMIN,
        ]);
    });

    it('treats plugins with undefined daoAddress as non-root without throwing', () => {
        const root = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: false,
            address: '0x1',
        });
        const undefinedAddress = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            isSubPlugin: false,
            address: '0x2',
        });

        const sorted = pluginSortUtils.sortByDisplayOrder(
            [undefinedAddress, root],
            { rootDaoAddress: ROOT_DAO_ADDRESS },
        );
        expect(sorted).toEqual([root, undefinedAddress]);
    });

    it('preserves original order for equal-priority plugins (stable sort)', () => {
        const first = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0xFirst',
        });
        const second = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0xSecond',
        });

        const sorted = pluginSortUtils.sortByDisplayOrder([first, second], {
            rootDaoAddress: ROOT_DAO_ADDRESS,
        });
        expect(sorted.map((p) => p.meta.address)).toEqual([
            '0xFirst',
            '0xSecond',
        ]);
    });

    it('sorts a mixed set: root by type, then non-root by type', () => {
        const rootToken = buildFilterPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: false,
            address: '0x1',
        });
        const rootMultisig = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: false,
            address: '0x2',
        });
        const linkedMultisig = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: '0xLinked',
            isSubPlugin: false,
            address: '0x3',
        });
        const subLock = buildFilterPlugin({
            interfaceType: PluginInterfaceType.LOCK_TO_VOTE,
            daoAddress: ROOT_DAO_ADDRESS,
            isSubPlugin: true,
            address: '0x4',
        });

        const sorted = pluginSortUtils.sortByDisplayOrder(
            [subLock, linkedMultisig, rootMultisig, rootToken],
            { rootDaoAddress: ROOT_DAO_ADDRESS },
        );
        expect(sorted.map((p) => p.meta.address)).toEqual([
            '0x1',
            '0x2',
            '0x4',
            '0x3',
        ]);
    });

    it('does not mutate the original array', () => {
        const plugins = [
            buildFilterPlugin({
                interfaceType: PluginInterfaceType.LOCK_TO_VOTE,
                daoAddress: ROOT_DAO_ADDRESS,
                address: '0x1',
            }),
            buildFilterPlugin({
                interfaceType: PluginInterfaceType.TOKEN_VOTING,
                daoAddress: ROOT_DAO_ADDRESS,
                address: '0x2',
            }),
        ];
        const original = [...plugins];

        pluginSortUtils.sortByDisplayOrder(plugins, {
            rootDaoAddress: ROOT_DAO_ADDRESS,
        });
        expect(plugins).toEqual(original);
    });

    it('accepts a custom typePriority to override the default sort order', () => {
        const multisig = buildFilterPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x1',
        });
        const token = buildFilterPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            daoAddress: ROOT_DAO_ADDRESS,
            address: '0x2',
        });

        const sorted = pluginSortUtils.sortByDisplayOrder([token, multisig], {
            rootDaoAddress: ROOT_DAO_ADDRESS,
            typePriority: {
                [PluginInterfaceType.MULTISIG]: 1,
                [PluginInterfaceType.TOKEN_VOTING]: 2,
            },
        });
        expect(sorted.map((p) => p.meta.interfaceType)).toEqual([
            PluginInterfaceType.MULTISIG,
            PluginInterfaceType.TOKEN_VOTING,
        ]);
    });
});
