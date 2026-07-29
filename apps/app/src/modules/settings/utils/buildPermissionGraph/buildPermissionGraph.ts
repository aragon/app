import { addressUtils } from '@aragon/gov-ui-kit';
import type {
    IDao,
    IDaoPlugin,
    IPermissionEntityRef,
} from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { ALLOW_FLAG } from '../../constants/permissionSentinels';
import type {
    IPermissionGraph,
    IPermissionGraphEdge,
    IPermissionGraphNode,
    IPermissionRow,
} from '../../types';
import { conditionTypeUtils } from '../conditionTypeUtils';
import {
    type IPermissionAccountRef,
    permissionEntityUtils,
} from '../permissionEntityUtils';

const NO_CONDITION_LABEL = '-';

/**
 * Condition contracts are already conveyed as the `if …` label on the
 * permission edge, so rendering them as their own graph node is pure
 * duplication. Drop any permission whose actor or target *is* a condition
 * contract from the graph (the condition annotation on real permissions is
 * unaffected). `unknown` / unresolved `contract` endpoints stay — they remain
 * selectable and are gated by the supporting-permissions toggle upstream.
 */
const isGraphExcludedEndpoint = (entity?: IPermissionEntityRef): boolean =>
    entity?.layer === 'condition';

export interface IBuildPermissionGraphParams {
    rows: IPermissionRow[];
    dao: IDao;
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    accountRefs?: IPermissionAccountRef[];
}

const resolveNode = (
    address: string,
    dao: IDao,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
    accountRefs?: IPermissionAccountRef[],
    enrichedEntity?: IPermissionEntityRef,
): IPermissionGraphNode => {
    const id = address.toLowerCase();

    if (addressUtils.isAddressEqual(address, dao.address)) {
        const account = accountRefs?.find((item) =>
            addressUtils.isAddressEqual(item.address, address),
        );

        return {
            id,
            kind: 'dao',
            label: account?.name ?? dao.name,
            avatarSrc: account?.avatarSrc ?? dao.avatar ?? undefined,
            address,
        };
    }

    const linkedAccount = accountRefs?.find((item) =>
        addressUtils.isAddressEqual(item.address, address),
    );

    if (linkedAccount != null) {
        return {
            id,
            kind: 'linkedDao',
            label: linkedAccount.name,
            avatarSrc: linkedAccount.avatarSrc,
            address,
        };
    }

    const entity = permissionEntityUtils.resolvePermissionEntity(address, {
        daoPlugins,
        accounts: accountRefs,
        entity: enrichedEntity,
    });

    if (entity.type === 'plugin') {
        return {
            id,
            kind: 'plugin',
            label: entity.label,
            tag: entity.tag,
            layer: entity.layer,
            status: entity.status,
            brandId: entity.brandId,
            address,
        };
    }

    return {
        id,
        kind: 'actor',
        label: entity.label,
        layer: entity.layer,
        status: entity.status,
        brandId: entity.brandId,
        address,
    };
};

const resolveEdge = (row: IPermissionRow): IPermissionGraphEdge => {
    const conditionAddress = row.conditionAddress ?? ALLOW_FLAG;
    const conditionType = conditionTypeUtils.resolveConditionType(
        conditionAddress,
        row.condition,
    );
    const conditionLabel = conditionTypeUtils.getConditionLabel(conditionType);

    const whoAddress = row.whoAddress.toLowerCase();
    const whereAddress = row.whereAddress.toLowerCase();
    const conditionNodeAddress = conditionAddress.toLowerCase();

    return {
        id: `${row.permissionId}-${whoAddress}-${whereAddress}-${conditionNodeAddress}`,
        source: whoAddress,
        target: whereAddress,
        permissionName: permissionNameUtils.getPermissionName(row.permissionId),
        permissionDisplayName: permissionNameUtils.getPermissionDisplayName(
            row.permissionId,
        ),
        conditionLabel:
            conditionLabel === NO_CONDITION_LABEL ? undefined : conditionLabel,
        row,
    };
};

export const buildPermissionGraph = (
    params: IBuildPermissionGraphParams,
): IPermissionGraph => {
    const { rows, dao, daoPlugins, accountRefs } = params;
    const nodesById = new Map<string, IPermissionGraphNode>();

    const ensureNode = (
        address: string,
        entity?: IPermissionEntityRef,
    ): void => {
        const id = address.toLowerCase();

        if (!nodesById.has(id)) {
            nodesById.set(
                id,
                resolveNode(address, dao, daoPlugins, accountRefs, entity),
            );
        }
    };

    const graphRows = rows.filter(
        (row) =>
            !isGraphExcludedEndpoint(row.who) &&
            !isGraphExcludedEndpoint(row.where),
    );

    const edges = graphRows.map((row) => {
        ensureNode(row.whoAddress, row.who);
        ensureNode(row.whereAddress, row.where);

        return resolveEdge(row);
    });

    return { nodes: [...nodesById.values()], edges };
};
