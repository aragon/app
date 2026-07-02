import type { IPermissionRow } from './permissionRow';

/**
 * Discriminator for a permission-graph node, driving both layout grouping and
 * the node component rendered for it.
 *
 * - `dao` — the primary DAO the permissions belong to.
 * - `linkedDao` — a DAO linked to the primary DAO (see `IDao.linkedAccounts`).
 * - `plugin` — an installed DAO plugin (e.g. a Multisig / SPP process).
 * - `actor` — any other grantee/target: a sentinel (`Anyone` / `Any Address`)
 *   or a plain externally-owned address.
 */
export type PermissionNodeKind = 'dao' | 'linkedDao' | 'plugin' | 'actor';

/**
 * A single node in the permission graph. One node per unique `who` / `where`
 * address across all permission rows.
 */
export interface IPermissionGraphNode {
    /**
     * Stable node id — the lowercased address the node represents.
     */
    id: string;
    /**
     * Classified node kind used to pick the node component and layout treatment.
     */
    kind: PermissionNodeKind;
    /**
     * Human-readable label (DAO / plugin / sentinel name, or truncated address).
     */
    label: string;
    /**
     * Short type tag for plugin nodes (e.g. `MULTISIG` / `SPP`). Undefined for
     * every other kind.
     */
    tag?: string;
    /**
     * Avatar image source for DAO / linked DAO nodes. Undefined for plugins and
     * actors, and may be null when the DAO has no avatar set.
     */
    avatarSrc?: string | null;
    /**
     * The original, unmodified address the node represents.
     */
    address: string;
}

/**
 * A single directed edge in the permission graph: `who` (source) is granted a
 * permission over `where` (target).
 */
export interface IPermissionGraphEdge {
    /**
     * Stable edge id, unique per `(permission, who, where)` triple.
     */
    id: string;
    /**
     * Source node id (the `who` address, lowercased).
     */
    source: string;
    /**
     * Target node id (the `where` address, lowercased).
     */
    target: string;
    /**
     * Resolved permission name (e.g. `EXECUTE_PERMISSION`), or a truncated hash
     * when the permission id is unknown.
     */
    permissionName: string;
    /**
     * Resolved condition label rendered as an `if <label>` suffix. Undefined for
     * unconditional grants and unresolvable condition types.
     */
    conditionLabel?: string;
    /**
     * The underlying permission row, used to render the expanded detail card
     * (permission details + condition slot) when the edge is selected.
     */
    row: IPermissionRow;
}

/**
 * The full permission graph: deduplicated nodes plus the directed permission
 * edges between them. Produced by `buildPermissionGraph`.
 */
export interface IPermissionGraph {
    nodes: IPermissionGraphNode[];
    edges: IPermissionGraphEdge[];
}
