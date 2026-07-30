import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import {
    generateDao,
    generateFilterComponentPlugin,
    generateLinkedAccount,
} from '@/shared/testUtils/generators';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import type { IPermissionRow } from '../../types';
import { buildPermissionGraph } from './buildPermissionGraph';

const ROOT_PERMISSION_ID =
    '0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33';
const EXECUTE_PERMISSION_ID =
    '0xbf04b4486c9663d805744005c3da000eda93de6e3308a4a7a812eb565327b78d';
const CREATE_PROPOSAL_PERMISSION_ID =
    '0x8c433a4cd6b51969eca37f974940894297b9fcf4b282a213fea5cd8f85289c90';

const daoAddress = '0x1F2e3D4C5b6A70819283746556473829100AbCdE';
const pluginAddress = '0xA1b2C3d4E5F60718293A4b5C6d7E8f9001234567';
const linkedDaoAddress = '0xdEAD000000000000000042069420694206942069';
const conditionAddress = '0xC0Ffee254729296a45a3885639AC7E10F9d54979';
const secondPluginAddress = '0xB1b2C3d4E5F60718293A4b5C6d7E8f9001234567';
const multisigAddress = '0xC1b2C3d4E5F60718293A4b5C6d7E8f9001234567';

const daoPlugins = [
    generateFilterComponentPlugin<IDaoPlugin, object>({
        meta: {
            address: pluginAddress,
            name: 'Founders',
            interfaceType: 'multisig',
        } as IDaoPlugin,
    }),
] satisfies IFilterComponentPlugin<IDaoPlugin>[];

const dao = generateDao({
    address: daoAddress,
    name: 'Patito DAO',
    avatar: 'https://patito.png',
    linkedAccounts: [
        generateLinkedAccount({
            address: linkedDaoAddress,
            name: 'Patito Developer DAO',
            avatar: 'https://patito-dev.png',
        }),
    ],
});

const accountRefs = [
    {
        address: daoAddress,
        name: 'Patito DAO',
        avatarSrc: 'https://patito.png',
    },
    {
        address: linkedDaoAddress,
        name: 'Patito Developer DAO',
        avatarSrc: 'https://patito-dev.png',
    },
];

const buildRow = (partial: Partial<IPermissionRow>): IPermissionRow => ({
    permissionId: EXECUTE_PERMISSION_ID,
    whoAddress: pluginAddress,
    whereAddress: daoAddress,
    conditionAddress: ALLOW_FLAG,
    ...partial,
});

describe('buildPermissionGraph', () => {
    it('classifies DAO, linked DAO, plugin, and actor nodes', () => {
        const graph = buildPermissionGraph({
            rows: [
                buildRow({ whoAddress: pluginAddress }),
                buildRow({
                    permissionId: ROOT_PERMISSION_ID,
                    whoAddress: ANY_ADDR,
                    whereAddress: linkedDaoAddress,
                }),
            ],
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(graph.nodes.find((node) => node.kind === 'dao')).toMatchObject({
            label: 'Patito DAO',
            avatarSrc: 'https://patito.png',
        });
        expect(
            graph.nodes.find((node) => node.kind === 'linkedDao'),
        ).toMatchObject({
            label: 'Patito Developer DAO',
            avatarSrc: 'https://patito-dev.png',
        });
        expect(
            graph.nodes.find((node) => node.kind === 'plugin'),
        ).toMatchObject({ label: 'Founders', tag: 'MULTISIG' });
        expect(graph.nodes.find((node) => node.kind === 'actor')).toMatchObject(
            { label: 'Anyone' },
        );
    });

    it('uses backend entity metadata without installed plugin lookup', () => {
        const row = buildRow({
            whoAddress: pluginAddress,
            who: {
                address: pluginAddress,
                interfaceType: 'spp',
                label: 'Backend Process',
                layer: 'topLevelPlugin',
                status: 'installed',
            },
        });

        const graph = buildPermissionGraph({
            rows: [row],
            dao,
            accountRefs,
        });

        expect(
            graph.nodes.find((node) => node.id === pluginAddress.toLowerCase()),
        ).toMatchObject({
            kind: 'plugin',
            label: 'Backend Process',
            tag: 'SPP',
            layer: 'topLevelPlugin',
            status: 'installed',
        });
    });

    it('carries backend Safe brand metadata onto graph nodes', () => {
        const row = buildRow({
            whoAddress: pluginAddress,
            who: {
                address: pluginAddress,
                label: 'Process internal',
                layer: 'processInternal',
                brandId: 'safe',
            },
        });

        const graph = buildPermissionGraph({
            rows: [row],
            dao,
            accountRefs,
        });

        expect(
            graph.nodes.find((node) => node.id === pluginAddress.toLowerCase()),
        ).toMatchObject({
            kind: 'plugin',
            brandId: 'safe',
        });
    });

    it('drops condition-contract permissions from the graph', () => {
        const conditionRow = buildRow({
            whoAddress: daoAddress,
            whereAddress: conditionAddress,
            where: {
                address: conditionAddress,
                layer: 'condition',
                label: 'Condition contract',
                status: 'installed',
            },
        });

        const graph = buildPermissionGraph({
            rows: [conditionRow],
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(graph.edges).toHaveLength(0);
        expect(
            graph.nodes.find(
                (node) => node.id === conditionAddress.toLowerCase(),
            ),
        ).toBeUndefined();
    });

    it('creates who-to-where edges with resolved permission and condition labels', () => {
        const row = buildRow({
            conditionAddress,
            condition: { conditionType: 'voting-power' },
        });

        const graph = buildPermissionGraph({
            rows: [row],
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(graph.edges).toHaveLength(1);
        expect(graph.edges[0]).toMatchObject({
            source: pluginAddress.toLowerCase(),
            target: daoAddress.toLowerCase(),
            permissionName: 'EXECUTE_PERMISSION',
            permissionDisplayName: 'Execute',
            conditionLabel: 'VotingPower',
            row,
        });
    });

    it('creates per-target proposal creator who nodes for open proposal grants', () => {
        const rows = [
            buildRow({
                permissionId: CREATE_PROPOSAL_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: pluginAddress,
                where: {
                    address: pluginAddress,
                    interfaceType: 'spp',
                    label: 'Core Governance',
                    layer: 'topLevelPlugin',
                },
                conditionAddress,
                condition: { conditionType: 'unknown' },
            }),
            buildRow({
                permissionId: CREATE_PROPOSAL_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: secondPluginAddress,
                where: {
                    address: secondPluginAddress,
                    interfaceType: 'spp',
                    label: 'Polling',
                    layer: 'topLevelPlugin',
                },
                conditionAddress,
                condition: { conditionType: 'unknown' },
            }),
        ];

        const graph = buildPermissionGraph({
            rows,
            dao,
            daoPlugins,
            accountRefs,
        });
        const creatorNodes = graph.nodes.filter((node) =>
            node.id.startsWith('proposal-creator-'),
        );

        expect(creatorNodes).toHaveLength(2);
        expect(creatorNodes.map((node) => node.label)).toEqual([
            'Anyone',
            'Anyone',
        ]);
        expect(new Set(creatorNodes.map((node) => node.id)).size).toBe(2);
        expect(graph.edges.map((edge) => edge.source)).toEqual(
            creatorNodes.map((node) => node.id),
        );
        expect(graph.edges.map((edge) => edge.target)).toEqual([
            pluginAddress.toLowerCase(),
            secondPluginAddress.toLowerCase(),
        ]);
        expect(graph.edges.map((edge) => edge.permissionName)).toEqual([
            'CREATE_PROPOSAL_PERMISSION',
            'CREATE_PROPOSAL_PERMISSION',
        ]);
        expect(graph.edges.map((edge) => edge.conditionLabel)).toEqual([
            'Unrecognized condition',
            'Unrecognized condition',
        ]);
    });

    it('labels multisig proposal creators as members of the multisig', () => {
        const row = buildRow({
            permissionId: CREATE_PROPOSAL_PERMISSION_ID,
            whoAddress: multisigAddress,
            who: {
                address: multisigAddress,
                interfaceType: 'multisig',
                label: 'Treasury Multisig',
                layer: 'topLevelPlugin',
            },
            whereAddress: pluginAddress,
            where: {
                address: pluginAddress,
                interfaceType: 'spp',
                label: 'Core Governance',
                layer: 'topLevelPlugin',
            },
        });

        const graph = buildPermissionGraph({
            rows: [row],
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(
            graph.nodes.find((node) => node.id.startsWith('proposal-creator-')),
        ).toMatchObject({
            kind: 'actor',
            label: 'Members of Treasury Multisig',
            address: multisigAddress,
        });
    });

    it('keeps Safe proposal creator labels and brand metadata', () => {
        const row = buildRow({
            permissionId: CREATE_PROPOSAL_PERMISSION_ID,
            whoAddress: multisigAddress,
            who: {
                address: multisigAddress,
                brandId: 'safe',
                label: 'Safe',
                layer: 'processInternal',
            },
            whereAddress: pluginAddress,
            where: {
                address: pluginAddress,
                interfaceType: 'spp',
                label: 'Core Governance',
                layer: 'topLevelPlugin',
            },
        });

        const graph = buildPermissionGraph({
            rows: [row],
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(
            graph.nodes.find((node) => node.id.startsWith('proposal-creator-')),
        ).toMatchObject({
            kind: 'plugin',
            label: 'Safe',
            brandId: 'safe',
            address: multisigAddress,
        });
    });

    it('styles concrete plugin proposal creators as their real body', () => {
        const row = buildRow({
            permissionId: CREATE_PROPOSAL_PERMISSION_ID,
            whoAddress: secondPluginAddress,
            who: {
                address: secondPluginAddress,
                interfaceType: 'spp',
                label: 'Polling',
                layer: 'topLevelPlugin',
            },
            whereAddress: pluginAddress,
            where: {
                address: pluginAddress,
                interfaceType: 'spp',
                label: 'Core Governance',
                layer: 'topLevelPlugin',
            },
        });

        const graph = buildPermissionGraph({
            rows: [row],
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(
            graph.nodes.find((node) => node.id.startsWith('proposal-creator-')),
        ).toMatchObject({
            kind: 'plugin',
            label: 'Polling',
            tag: 'SPP',
            address: secondPluginAddress,
        });
    });

    it('omits condition labels for unconditional grants', () => {
        const graph = buildPermissionGraph({
            rows: [buildRow({ conditionAddress: ALLOW_FLAG })],
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(graph.edges[0].conditionLabel).toBeUndefined();
    });

    it('keeps conditional permissions with the same endpoints distinct', () => {
        const votingPowerCondition =
            '0xC0Ffee254729296a45a3885639AC7E10F9d54979';
        const membershipCondition =
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF';
        const rows = [
            buildRow({ conditionAddress: votingPowerCondition }),
            buildRow({ conditionAddress: membershipCondition }),
        ];

        const graph = buildPermissionGraph({
            rows,
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(graph.edges).toHaveLength(2);
        expect(new Set(graph.edges.map((edge) => edge.id)).size).toBe(2);
        expect(graph.edges.map((edge) => edge.source)).toEqual([
            pluginAddress.toLowerCase(),
            pluginAddress.toLowerCase(),
        ]);
        expect(graph.edges.map((edge) => edge.target)).toEqual([
            daoAddress.toLowerCase(),
            daoAddress.toLowerCase(),
        ]);
    });
});
