import { addressUtils } from '@aragon/gov-ui-kit';
import type {
    IDao,
    IDaoPlugin,
    IPermissionEntityRef,
} from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
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
const CREATE_PROPOSAL_PERMISSION_NAME = 'CREATE_PROPOSAL_PERMISSION';
const PROPOSAL_CREATOR_NODE_PREFIX = 'proposal-creator';

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

interface IResolveEdgeOptions {
    sourceId?: string;
}

const isGoverningBodyTarget = (row: IPermissionRow): boolean =>
    row.where?.layer === 'topLevelPlugin' ||
    row.where?.layer === 'historicalPlugin';

const isProposalCreatorRow = (row: IPermissionRow): boolean =>
    permissionNameUtils.getPermissionName(row.permissionId) ===
        CREATE_PROPOSAL_PERMISSION_NAME && isGoverningBodyTarget(row);

const isOpenProposalCreatorRow = (row: IPermissionRow): boolean =>
    isProposalCreatorRow(row) &&
    addressUtils.isAddressEqual(row.whoAddress, ANY_ADDR);

const getOpenProposalTargets = (rows: IPermissionRow[]): Set<string> =>
    new Set(
        rows
            .filter(isOpenProposalCreatorRow)
            .map((row) => row.whereAddress.toLowerCase()),
    );

// An open "Anyone" proposal grant on a governing body trumps every more-specific
// proposal-creation eligibility on that same body (token thresholds, multisig
// members, SPP stage bodies). Those grants are real, but redundant to show once
// anyone can propose, so they are dropped from the graph.
const isSubsumedProposalCreatorRow = (
    row: IPermissionRow,
    openProposalTargets: Set<string>,
): boolean =>
    isProposalCreatorRow(row) &&
    !addressUtils.isAddressEqual(row.whoAddress, ANY_ADDR) &&
    openProposalTargets.has(row.whereAddress.toLowerCase());

const getProposalCreatorNodeId = (row: IPermissionRow): string => {
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
    row: IPermissionRow,
    dao: IDao,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
    accountRefs?: IPermissionAccountRef[],
): IPermissionGraphNode => {
    const baseNode = resolveNode(
        row.whoAddress,
        dao,
        daoPlugins,
        accountRefs,
        row.who,
    );
    const interfaceType = row.who?.interfaceType?.toLowerCase();
    const isSafeEntity = baseNode.brandId === 'safe';
    const isMultisigMember = !isSafeEntity && interfaceType === 'multisig';

    if (isMultisigMember) {
        return {
            id: getProposalCreatorNodeId(row),
            kind: 'actor',
            label: `Members of ${baseNode.label}`,
            layer: baseNode.layer,
            status: baseNode.status,
            brandId: baseNode.brandId,
            address: row.whoAddress,
        };
    }

    return {
        ...baseNode,
        id: getProposalCreatorNodeId(row),
        address: row.whoAddress,
    };
};

const resolveEdge = (
    row: IPermissionRow,
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
    const openProposalTargets = getOpenProposalTargets(graphRows);

    const edges = graphRows
        .filter(
            (row) => !isSubsumedProposalCreatorRow(row, openProposalTargets),
        )
        .map((row) => {
            const isProposalCreator = isProposalCreatorRow(row);

            if (isProposalCreator) {
                const creatorNode = resolveProposalCreatorNode(
                    row,
                    dao,
                    daoPlugins,
                    accountRefs,
                );
                nodesById.set(creatorNode.id, creatorNode);
                ensureNode(row.whereAddress, row.where);

                return resolveEdge(row, {
                    sourceId: creatorNode.id,
                });
            }

            ensureNode(row.whoAddress, row.who);
            ensureNode(row.whereAddress, row.where);

            return resolveEdge(row);
        });

    return { nodes: [...nodesById.values()], edges };
};
