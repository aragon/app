import { addressUtils } from '@aragon/gov-ui-kit';
import type {
    IDao,
    IDaoPermission,
    IDaoPlugin,
    IPermissionEntityRef,
} from '@/shared/api/daoService';
import { PermissionEntityBrandId } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { ALLOW_FLAG } from '../../constants/permissionSentinels';
import type {
    IPermissionGraph,
    IPermissionGraphEdge,
    IPermissionGraphNode,
} from '../../types';
import { conditionTypeUtils } from '../conditionTypeUtils';
import {
    type IPermissionAccountRef,
    permissionEntityUtils,
} from '../permissionEntityUtils';

const NO_CONDITION_LABEL = '-';
const PROPOSAL_CREATOR_NODE_PREFIX = 'proposal-creator';
const isGoverningBodyProposalCreationRow = (row: IDaoPermission): boolean =>
    permissionNameUtils.getPermissionName(row.permissionId) ===
        permissionTransactionUtils.permissionIds.createProposalPermission &&
    (row.where?.layer === 'topLevelPlugin' ||
        row.where?.layer === 'historicalPlugin');

/**
 * Condition contracts are already conveyed as the `if …` label on the
 * permission edge, so rendering them as their own graph node is pure
 * duplication. Drop any permission whose actor or target *is* a condition
 * contract from the graph (the condition annotation on real permissions is
 * unaffected). `unknown` / unresolved `contract` endpoints stay because page
 * selection hides only DAO-granted and true subplugin-touching rows.
 */
const isGraphExcludedEndpoint = (entity?: IPermissionEntityRef): boolean =>
    entity?.layer === 'condition';

export interface IBuildPermissionGraphParams {
    rows: IDaoPermission[];
    dao: IDao;
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    accountRefs?: IPermissionAccountRef[];
}

type IResolveNodeContext = Omit<IBuildPermissionGraphParams, 'rows'>;

const resolveNode = (
    address: string,
    context: IResolveNodeContext,
    enrichedEntity?: IPermissionEntityRef,
): IPermissionGraphNode => {
    const { dao, daoPlugins, accountRefs } = context;
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

interface IResolveEdgeOptions {
    sourceId?: string;
}

const getProposalCreatorNodeId = (row: IDaoPermission): string => {
    const conditionAddress = row.conditionAddress ?? ALLOW_FLAG;

    return [
        PROPOSAL_CREATOR_NODE_PREFIX,
        row.permissionId,
        row.whoAddress,
        row.whereAddress,
        conditionAddress,
    ]
        .map((part) => part.toLowerCase())
        .join('-');
};

const resolveProposalCreatorNode = (
    row: IDaoPermission,
    context: IResolveNodeContext,
): IPermissionGraphNode => {
    const baseNode = resolveNode(row.whoAddress, context, row.who);
    const id = getProposalCreatorNodeId(row);
    const isMultisigMembers =
        baseNode.brandId !== PermissionEntityBrandId.SAFE &&
        row.who?.interfaceType?.toLowerCase() === 'multisig';

    if (!isMultisigMembers) {
        return { ...baseNode, id };
    }

    return {
        id,
        kind: 'actor',
        label: `Members of ${baseNode.label}`,
        layer: baseNode.layer,
        status: baseNode.status,
        brandId: baseNode.brandId,
        address: row.whoAddress,
    };
};

const resolveEdge = (
    row: IDaoPermission,
    options: IResolveEdgeOptions = {},
): IPermissionGraphEdge => {
    const { sourceId } = options;
    const conditionAddress = row.conditionAddress ?? ALLOW_FLAG;
    const conditionType = conditionTypeUtils.resolveConditionType(
        conditionAddress,
        row.condition,
    );
    const conditionLabel = conditionTypeUtils.getConditionLabel(conditionType);

    const whoAddress = row.whoAddress.toLowerCase();
    const whereAddress = row.whereAddress.toLowerCase();
    const conditionNodeAddress = conditionAddress.toLowerCase();
    const shouldOmitConditionLabel = conditionLabel === NO_CONDITION_LABEL;

    return {
        id: `${row.permissionId}-${whoAddress}-${whereAddress}-${conditionNodeAddress}`,
        source: sourceId ?? whoAddress,
        target: whereAddress,
        permissionName: permissionNameUtils.getPermissionName(row.permissionId),
        permissionDisplayName: permissionNameUtils.getPermissionDisplayName(
            row.permissionId,
        ),
        conditionLabel: shouldOmitConditionLabel ? undefined : conditionLabel,
        row,
    };
};

export const buildPermissionGraph = (
    params: IBuildPermissionGraphParams,
): IPermissionGraph => {
    const { rows, ...context } = params;
    const nodesById = new Map<string, IPermissionGraphNode>();

    const ensureNode = (
        address: string,
        entity?: IPermissionEntityRef,
    ): void => {
        const id = address.toLowerCase();

        if (!nodesById.has(id)) {
            nodesById.set(id, resolveNode(address, context, entity));
        }
    };

    const graphRows = rows.filter(
        (row) =>
            !isGraphExcludedEndpoint(row.who) &&
            !isGraphExcludedEndpoint(row.where),
    );

    const edges: IPermissionGraphEdge[] = [];

    for (const row of graphRows) {
        if (!isGoverningBodyProposalCreationRow(row)) {
            ensureNode(row.whoAddress, row.who);
            ensureNode(row.whereAddress, row.where);
            edges.push(resolveEdge(row));
            continue;
        }

        const creatorNode = resolveProposalCreatorNode(row, context);
        nodesById.set(creatorNode.id, creatorNode);
        ensureNode(row.whereAddress, row.where);
        edges.push(resolveEdge(row, { sourceId: creatorNode.id }));
    }

    return { nodes: [...nodesById.values()], edges };
};
