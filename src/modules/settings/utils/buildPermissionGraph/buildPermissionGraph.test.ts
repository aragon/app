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

// Real keccak256 permission-id hashes so permissionNameUtils resolves names.
const ROOT_PERMISSION_ID =
    '0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33';
const EXECUTE_PERMISSION_ID =
    '0xbf04b4486c9663d805744005c3da000eda93de6e3308a4a7a812eb565327b78d';

const daoAddress = '0x1F2e3D4C5b6A70819283746556473829100AbCdE';
const pluginAddress = '0xA1b2C3d4E5F60718293A4b5C6d7E8f9001234567';
const linkedDaoAddress = '0xdEAD000000000000000042069420694206942069';
const conditionAddress = '0xC0Ffee254729296a45a3885639AC7E10F9d54979';

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

const buildRow = (partial: Partial<IPermissionRow>): IPermissionRow => ({
    permissionId: EXECUTE_PERMISSION_ID,
    whoAddress: pluginAddress,
    whereAddress: daoAddress,
    conditionAddress: ALLOW_FLAG,
    ...partial,
});

describe('buildPermissionGraph', () => {
    it('classifies the DAO address as a dao-kind node labeled with the DAO name', () => {
        const graph = buildPermissionGraph({
            rows: [
                buildRow({
                    whoAddress: pluginAddress,
                    whereAddress: daoAddress,
                }),
            ],
            dao,
            daoPlugins,
        });

        const daoNode = graph.nodes.find((node) => node.kind === 'dao');
        expect(daoNode).toMatchObject({
            label: 'Patito DAO',
            address: daoAddress,
            avatarSrc: 'https://patito.png',
        });
    });

    it('classifies a linked account address as a linkedDao-kind node', () => {
        const graph = buildPermissionGraph({
            rows: [
                buildRow({
                    whoAddress: daoAddress,
                    whereAddress: linkedDaoAddress,
                }),
            ],
            dao,
            daoPlugins,
        });

        const linkedNode = graph.nodes.find(
            (node) => node.kind === 'linkedDao',
        );
        expect(linkedNode).toMatchObject({
            label: 'Patito Developer DAO',
            address: linkedDaoAddress,
            avatarSrc: 'https://patito-dev.png',
        });
    });

    it('classifies a matched plugin as a plugin-kind node with its type tag', () => {
        const graph = buildPermissionGraph({
            rows: [buildRow({ whoAddress: pluginAddress })],
            dao,
            daoPlugins,
        });

        const pluginNode = graph.nodes.find((node) => node.kind === 'plugin');
        expect(pluginNode).toMatchObject({
            label: 'Founders',
            tag: 'MULTISIG',
        });
    });

    it('classifies the ANY_ADDR sentinel as an actor-kind node labeled "Anyone"', () => {
        const graph = buildPermissionGraph({
            rows: [
                buildRow({ whoAddress: ANY_ADDR, whereAddress: pluginAddress }),
            ],
            dao,
            daoPlugins,
        });

        const actorNode = graph.nodes.find((node) => node.kind === 'actor');
        expect(actorNode).toMatchObject({ label: 'Anyone' });
        expect(actorNode?.tag).toBeUndefined();
    });

    it('deduplicates a single node when an address appears across multiple rows', () => {
        const graph = buildPermissionGraph({
            rows: [
                buildRow({
                    whoAddress: pluginAddress,
                    whereAddress: daoAddress,
                }),
                buildRow({
                    permissionId: ROOT_PERMISSION_ID,
                    whoAddress: ANY_ADDR,
                    whereAddress: daoAddress,
                }),
            ],
            dao,
            daoPlugins,
        });

        const daoNodes = graph.nodes.filter(
            (node) => node.address === daoAddress,
        );
        expect(daoNodes).toHaveLength(1);
    });

    it('creates a who -> where edge with the resolved permission name', () => {
        const graph = buildPermissionGraph({
            rows: [
                buildRow({
                    permissionId: EXECUTE_PERMISSION_ID,
                    whoAddress: pluginAddress,
                    whereAddress: daoAddress,
                }),
            ],
            dao,
            daoPlugins,
        });

        expect(graph.edges).toHaveLength(1);
        expect(graph.edges[0]).toMatchObject({
            source: pluginAddress.toLowerCase(),
            target: daoAddress.toLowerCase(),
            permissionName: 'EXECUTE_PERMISSION',
        });
    });

    it('carries the underlying permission row on the edge', () => {
        const row = buildRow({
            permissionId: EXECUTE_PERMISSION_ID,
            whoAddress: pluginAddress,
            whereAddress: daoAddress,
            conditionAddress,
            condition: { conditionType: 'voting-power' },
        });

        const graph = buildPermissionGraph({ rows: [row], dao, daoPlugins });

        expect(graph.edges[0].row).toEqual(row);
    });

    it('labels the edge condition when a real condition is present', () => {
        const graph = buildPermissionGraph({
            rows: [
                buildRow({
                    whoAddress: pluginAddress,
                    whereAddress: daoAddress,
                    conditionAddress,
                    condition: { conditionType: 'voting-power' },
                }),
            ],
            dao,
            daoPlugins,
        });

        expect(graph.edges[0].conditionLabel).toBe('VotingPower');
    });

    it('omits the condition label for an unconditional (ALLOW_FLAG) grant', () => {
        const graph = buildPermissionGraph({
            rows: [buildRow({ conditionAddress: ALLOW_FLAG })],
            dao,
            daoPlugins,
        });

        expect(graph.edges[0].conditionLabel).toBeUndefined();
    });
});
