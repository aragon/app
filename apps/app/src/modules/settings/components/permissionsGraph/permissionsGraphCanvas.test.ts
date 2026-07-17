import type { IPermissionGraph, IPermissionGraphEdge } from '../../types';
import { getModeEdges } from './permissionsGraphCanvas';

const anchorId = '0x1111111111111111111111111111111111111111';
const pluginId = '0x2222222222222222222222222222222222222222';
const externalId = '0x3333333333333333333333333333333333333333';
const otherId = '0x4444444444444444444444444444444444444444';

const buildEdge = (
    id: string,
    partial: Pick<IPermissionGraphEdge, 'source' | 'target'>,
): IPermissionGraphEdge => ({
    id,
    permissionDisplayName: 'Permission',
    permissionName: 'PERMISSION',
    row: {
        permissionId: 'permission-id',
        whoAddress: partial.source,
        whereAddress: partial.target,
        conditionAddress: '0x0000000000000000000000000000000000000000',
    },
    ...partial,
});

const buildGraph = (edges: IPermissionGraphEdge[]): IPermissionGraph => ({
    nodes: [],
    edges,
});

describe('getModeEdges', () => {
    it('keeps old from-DAO and unrelated edges in other mode', () => {
        const grantedEdge = buildEdge('granted', {
            source: pluginId,
            target: anchorId,
        });
        const oldFromDaoEdge = buildEdge('old-from-dao', {
            source: anchorId,
            target: externalId,
        });
        const unrelatedEdge = buildEdge('unrelated', {
            source: otherId,
            target: externalId,
        });

        const result = getModeEdges(
            buildGraph([grantedEdge, oldFromDaoEdge, unrelatedEdge]),
            'other',
            anchorId,
        );

        expect(result).toEqual([oldFromDaoEdge, unrelatedEdge]);
    });
});
