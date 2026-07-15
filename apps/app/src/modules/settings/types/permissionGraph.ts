import type { IPermissionRow } from './permissionRow';

export type PermissionNodeKind = 'dao' | 'linkedDao' | 'plugin' | 'actor';

export interface IPermissionGraphNode {
    id: string;
    kind: PermissionNodeKind;
    label: string;
    tag?: string;
    avatarSrc?: string;
    address: string;
}

export interface IPermissionGraphEdge {
    id: string;
    source: string;
    target: string;
    permissionName: string;
    permissionDisplayName: string;
    conditionLabel?: string;
    row: IPermissionRow;
}

export interface IPermissionGraph {
    nodes: IPermissionGraphNode[];
    edges: IPermissionGraphEdge[];
}
