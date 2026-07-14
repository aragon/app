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
import {
    type IPermissionAccountRef,
    permissionEntityUtils,
} from '../permissionEntityUtils';

const NO_CONDITION_LABEL = '-';

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
    });

    if (entity.type === 'plugin') {
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
    const conditionType = conditionTypeUtils.resolveConditionType(
        row.conditionAddress,
        row.condition,
    );
    const conditionLabel = conditionTypeUtils.getConditionLabel(conditionType);

    return {
        id: `${row.permissionId}-${row.whoAddress.toLowerCase()}-${row.whereAddress.toLowerCase()}`,
        source: row.whoAddress.toLowerCase(),
        target: row.whereAddress.toLowerCase(),
        permissionName: permissionNameUtils.getPermissionName(row.permissionId),
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

    const ensureNode = (address: string): void => {
        const id = address.toLowerCase();

        if (!nodesById.has(id)) {
            nodesById.set(
                id,
                resolveNode(address, dao, daoPlugins, accountRefs),
            );
        }
    };

    const edges = rows.map((row) => {
        ensureNode(row.whoAddress);
        ensureNode(row.whereAddress);

        return resolveEdge(row);
    });

    return { nodes: [...nodesById.values()], edges };
};
