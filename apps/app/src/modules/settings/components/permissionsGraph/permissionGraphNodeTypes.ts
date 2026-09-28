import type { Node } from '@xyflow/react';
import type { IPermissionGraphNode } from '../../types';
import type { IPermissionEdgeEntry } from './permissionGraphEdge';

export type PermissionNodeSelectionRole = 'who' | 'where';

export interface IPermissionNodeData extends IPermissionGraphNode {
    selectionRole?: PermissionNodeSelectionRole;
    active?: boolean;
    dimmed?: boolean;
    [key: string]: unknown;
}

export type IPermissionFlowNode = Node<IPermissionNodeData, 'permission'>;

export interface IPermissionStackNodeData {
    permissions: IPermissionEdgeEntry[];
    active?: boolean;
    dimmed?: boolean;
    selfTargetId?: string;
    onSelect?: (edgeId: string) => void;
    [key: string]: unknown;
}

export type IPermissionStackFlowNode = Node<
    IPermissionStackNodeData,
    'permissionStack'
>;

export const PERMISSION_GRAPH_HANDLE = {
    sourceTop: 'source-top',
    sourceRight: 'source-right',
    sourceBottom: 'source-bottom',
    sourceLeft: 'source-left',
    targetTop: 'target-top',
    targetRight: 'target-right',
    targetBottom: 'target-bottom',
    targetLeft: 'target-left',
} as const;
