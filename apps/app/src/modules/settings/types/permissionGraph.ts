import type {
    IDaoPermission,
    IPermissionEntityRef,
} from '@/shared/api/daoService';

export type PermissionNodeKind = 'dao' | 'linkedDao' | 'plugin' | 'actor';

export interface IPermissionGraphNode {
    id: string;
    kind: PermissionNodeKind;
    /**
     * Name of the node, undefined when it is only an address: it is then shown by the address widget.
     */
    label?: string;
    versionName?: string;
    tag?: string;
    layer?: IPermissionEntityRef['layer'];
    status?: IPermissionEntityRef['status'];
    brandId?: IPermissionEntityRef['brandId'];
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
    row: IDaoPermission;
}

export interface IPermissionGraph {
    nodes: IPermissionGraphNode[];
    edges: IPermissionGraphEdge[];
}
