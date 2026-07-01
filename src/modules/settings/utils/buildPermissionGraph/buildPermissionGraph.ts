import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import type {
    IPermissionGraph,
    IPermissionGraphEdge,
    IPermissionGraphNode,
    IPermissionRow,
} from '../../types';
import { conditionTypeUtils } from '../conditionTypeUtils';
import { permissionEntityUtils } from '../permissionEntityUtils';

/**
 * Placeholder returned by `conditionTypeUtils.getConditionLabel` when there is
 * no displayable condition (unconditional grant or unresolvable type).
 */
const NO_CONDITION_LABEL = '-';

export interface IBuildPermissionGraphParams {
    /**
     * Permission rows to visualise (the same data the list view consumes).
     */
    rows: IPermissionRow[];
    /**
     * The DAO the permissions belong to, used to classify the DAO and its linked
     * DAO nodes.
     */
    dao: IDao;
    /**
     * Installed DAO plugins used to classify and label plugin nodes.
     */
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
}

const resolveNode = (
    address: string,
    dao: IDao,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): IPermissionGraphNode => {
    const id = address.toLowerCase();

    if (addressUtils.isAddressEqual(address, dao.address)) {
        return {
            id,
            kind: 'dao',
            label: dao.name,
            avatarSrc: dao.avatar,
            address,
        };
    }

    const linkedAccount = dao.linkedAccounts?.find((account) =>
        addressUtils.isAddressEqual(account.address, address),
    );

    if (linkedAccount != null) {
        return {
            id,
            kind: 'linkedDao',
            label: linkedAccount.name,
            avatarSrc: linkedAccount.avatar,
            address,
        };
    }

    const entity = permissionEntityUtils.resolvePermissionEntity(
        address,
        daoPlugins,
    );

    if (entity.tag != null) {
        return {
            id,
            kind: 'plugin',
            label: entity.label,
            tag: entity.tag,
            address,
        };
    }

    return { id, kind: 'actor', label: entity.label, address };
};

const resolveEdge = (row: IPermissionRow): IPermissionGraphEdge => {
    const source = row.whoAddress.toLowerCase();
    const target = row.whereAddress.toLowerCase();

    const permissionName = permissionNameUtils.getPermissionName(
        row.permissionId,
    );

    const conditionType = conditionTypeUtils.resolveConditionType(
        row.conditionAddress,
        row.condition,
    );
    const conditionLabel = conditionTypeUtils.getConditionLabel(conditionType);

    return {
        id: `${row.permissionId}-${source}-${target}`,
        source,
        target,
        permissionName,
        conditionLabel:
            conditionLabel === NO_CONDITION_LABEL ? undefined : conditionLabel,
        row,
    };
};

/**
 * Derives a permission graph (deduplicated nodes + directed permission edges)
 * from permission rows. Everything is derived from the data — node kinds and
 * labels come from the DAO context and the shared permission utilities, never
 * from hardcoded addresses.
 */
export const buildPermissionGraph = (
    params: IBuildPermissionGraphParams,
): IPermissionGraph => {
    const { rows, dao, daoPlugins } = params;

    const nodesById = new Map<string, IPermissionGraphNode>();

    const ensureNode = (address: string): void => {
        const id = address.toLowerCase();

        if (!nodesById.has(id)) {
            nodesById.set(id, resolveNode(address, dao, daoPlugins));
        }
    };

    const edges = rows.map((row) => {
        ensureNode(row.whoAddress);
        ensureNode(row.whereAddress);

        return resolveEdge(row);
    });

    return { nodes: [...nodesById.values()], edges };
};
