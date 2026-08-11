import type { IDaoPermission, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import {
    generateDao,
    generateDaoPermission,
    generateFilterComponentPlugin,
    generateLinkedAccount,
} from '@/shared/testUtils/generators';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
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

const buildRow = (partial: Partial<IDaoPermission>): IDaoPermission =>
    generateDaoPermission({
        permissionId: EXECUTE_PERMISSION_ID,
        whoAddress: pluginAddress,
        whereAddress: daoAddress,
        conditionAddress: ALLOW_FLAG,
        condition: undefined,
        conditionEntity: undefined,
        network: undefined,
        who: undefined,
        where: undefined,
        ...partial,
    });

// Shared fixture: a Safe process body granted create-proposal on a top-level
// plugin body, used both on its own and next to an open Anyone grant.
const buildSafeProposalCreatorRow = (): IDaoPermission =>
    buildRow({
        permissionId: CREATE_PROPOSAL_PERMISSION_ID,
        whoAddress: multisigAddress,
        who: {
            address: multisigAddress,
            brandId: 'safe',
            label: 'Process internal',
            layer: 'processInternal',
            parentPluginAddress: pluginAddress,
        },
        whereAddress: pluginAddress,
        where: {
            address: pluginAddress,
            interfaceType: 'spp',
            label: 'Core Governance',
            layer: 'topLevelPlugin',
        },
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

    it.each([
        {
            name: 'uses backend entity metadata without installed plugin lookup',
            row: buildRow({
                whoAddress: pluginAddress,
                who: {
                    address: pluginAddress,
                    interfaceType: 'spp',
                    label: 'Backend Process',
                    layer: 'topLevelPlugin',
                    status: 'installed',
                },
            }),
            expected: {
                kind: 'plugin',
                label: 'Backend Process',
                tag: 'SPP',
                layer: 'topLevelPlugin',
                status: 'installed',
            },
        },
        {
            name: 'carries backend Safe brand metadata onto graph nodes',
            row: buildRow({
                whoAddress: pluginAddress,
                who: {
                    address: pluginAddress,
                    label: 'Process internal',
                    layer: 'processInternal',
                    brandId: 'safe',
                },
            }),
            expected: { kind: 'plugin', brandId: 'safe' },
        },
    ])('$name', ({ row, expected }) => {
        const graph = buildPermissionGraph({
            rows: [row],
            dao,
            accountRefs,
        });

        expect(
            graph.nodes.find((node) => node.id === pluginAddress.toLowerCase()),
        ).toMatchObject(expected);
    });

    it('preserves every selected ordinary row and only omits condition endpoints', () => {
        const ordinaryRows = [
            buildRow({}),
            buildRow({
                permissionId: CREATE_PROPOSAL_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                who: {
                    address: ANY_ADDR,
                    label: 'Anyone',
                    layer: 'unknown',
                },
                whereAddress: pluginAddress,
                where: {
                    address: pluginAddress,
                    label: 'Core Governance',
                    layer: 'topLevelPlugin',
                },
            }),
            buildRow({
                permissionId: ROOT_PERMISSION_ID,
                whoAddress: secondPluginAddress,
                who: {
                    address: secondPluginAddress,
                    label: 'Historical plugin',
                    layer: 'historicalPlugin',
                    status: 'uninstalled',
                },
            }),
        ];
        const conditionTargetRow = buildRow({
            permissionId: ROOT_PERMISSION_ID,
            whereAddress: conditionAddress,
            where: {
                address: conditionAddress,
                label: 'Condition contract',
                layer: 'condition',
                status: 'installed',
            },
        });
        const conditionActorRow = buildRow({
            permissionId: ROOT_PERMISSION_ID,
            whoAddress: conditionAddress,
            who: {
                address: conditionAddress,
                label: 'Condition contract',
                layer: 'condition',
                status: 'installed',
            },
        });

        const graph = buildPermissionGraph({
            rows: [...ordinaryRows, conditionTargetRow, conditionActorRow],
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(graph.edges).toHaveLength(ordinaryRows.length);
        graph.edges.forEach((edge, index) => {
            expect(edge.row).toBe(ordinaryRows[index]);
        });
        // Condition endpoints are dropped as nodes too, not only as edges.
        expect(
            graph.nodes.find(
                (node) => node.id === conditionAddress.toLowerCase(),
            ),
        ).toBeUndefined();
    });

    it.each([
        {
            name: 'creates who-to-where edges with resolved permission and condition labels',
            row: buildRow({
                conditionAddress,
                condition: { conditionType: 'voting-power' },
            }),
            expected: {
                source: pluginAddress.toLowerCase(),
                target: daoAddress.toLowerCase(),
                permissionName: 'EXECUTE_PERMISSION',
                permissionDisplayName: 'Execute',
                conditionLabel: 'VotingPower',
            },
        },
        {
            name: 'omits condition labels for unconditional grants',
            row: buildRow({ conditionAddress: ALLOW_FLAG }),
            expected: { conditionLabel: undefined },
        },
    ])('$name', ({ row, expected }) => {
        const graph = buildPermissionGraph({
            rows: [row],
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(graph.edges).toHaveLength(1);
        expect(graph.edges[0]).toMatchObject({ ...expected, row });
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
            node.id.startsWith('governing-body-actor-'),
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

    it('deduplicates the primary DAO actor across governance bodies by canonical address', () => {
        const rows = [
            buildRow({
                whoAddress: daoAddress,
                whereAddress: pluginAddress,
                where: {
                    address: pluginAddress,
                    interfaceType: 'spp',
                    label: 'Core Governance',
                    layer: 'topLevelPlugin',
                },
            }),
            buildRow({
                whoAddress: daoAddress,
                whereAddress: secondPluginAddress,
                where: {
                    address: secondPluginAddress,
                    interfaceType: 'spp',
                    label: 'Polling',
                    layer: 'topLevelPlugin',
                },
            }),
        ];

        const graph = buildPermissionGraph({
            rows,
            dao,
            daoPlugins,
            accountRefs,
        });

        const daoNodes = graph.nodes.filter(
            (node) => node.id === daoAddress.toLowerCase(),
        );
        expect(daoNodes).toHaveLength(1);
        expect(daoNodes[0].kind).toBe('dao');
        expect(graph.edges.map((edge) => edge.source)).toEqual([
            daoAddress.toLowerCase(),
            daoAddress.toLowerCase(),
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
            graph.nodes.find((node) =>
                node.id.startsWith('governing-body-actor-'),
            ),
        ).toMatchObject({
            kind: 'actor',
            label: 'Members of Treasury Multisig',
            address: multisigAddress,
        });
    });

    it('keeps Safe proposal creator labels and brand metadata', () => {
        const graph = buildPermissionGraph({
            rows: [buildSafeProposalCreatorRow()],
            dao,
            daoPlugins,
            accountRefs,
        });

        expect(
            graph.nodes.find((node) =>
                node.id.startsWith('governing-body-actor-'),
            ),
        ).toMatchObject({
            kind: 'plugin',
            label: 'Safe',
            brandId: 'safe',
            address: multisigAddress,
        });
    });

    it('keeps specific proposal creators alongside an open Anyone grant on the body', () => {
        const rows = [
            buildRow({
                permissionId: CREATE_PROPOSAL_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                who: {
                    address: ANY_ADDR,
                    label: 'Unknown address',
                    layer: 'unknown',
                },
                whereAddress: pluginAddress,
                where: {
                    address: pluginAddress,
                    interfaceType: 'spp',
                    label: 'Core Governance',
                    layer: 'topLevelPlugin',
                },
            }),
            buildSafeProposalCreatorRow(),
        ];

        const graph = buildPermissionGraph({
            rows,
            dao,
            daoPlugins,
            accountRefs,
        });
        const creators = graph.nodes.filter((node) =>
            node.id.startsWith('governing-body-actor-'),
        );

        // GRF-1 regression guard.
        // No subsumption: the list and the graph show the same rows, so the
        // Safe body's create-proposal eligibility stays visible next to the
        // open Anyone grant on the same body.
        expect(creators).toHaveLength(2);
        expect(creators.map((node) => node.label)).toEqual(['Anyone', 'Safe']);
        expect(graph.edges).toHaveLength(2);
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
            graph.nodes.find((node) =>
                node.id.startsWith('governing-body-actor-'),
            ),
        ).toMatchObject({
            kind: 'plugin',
            label: 'Polling',
            tag: 'SPP',
            address: secondPluginAddress,
        });
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
