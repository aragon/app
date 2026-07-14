'use client';

import {
    Avatar,
    addressUtils,
    Button,
    CardEmptyState,
    DaoAvatar,
    DefinitionList,
    IconType,
    StateSkeletonBar,
    Tag,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { SettingsSlotId } from '../../constants/moduleSlots';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import type {
    IPermissionGraph,
    IPermissionGraphEdge,
    IPermissionGraphNode,
    IPermissionRow,
} from '../../types';
import { buildPermissionGraph } from '../../utils/buildPermissionGraph';
import { conditionTypeUtils } from '../../utils/conditionTypeUtils';
import type { IPermissionAccountRef } from '../../utils/permissionEntityUtils';
import { NoConditionSlot } from '../noConditionSlot';

export interface IPermissionsGraphProps {
    rows: IPermissionRow[];
    dao?: IDao;
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    accountRefs: IPermissionAccountRef[];
    isLoading: boolean;
    activeAccountAddress?: string;
}

type GraphMode = 'incoming' | 'outgoing' | 'other';

interface IGraphPoint {
    x: number;
    y: number;
}

const GRAPH_WIDTH = 1000;
const GRAPH_HEIGHT = 560;
const ANCHOR_POINT: IGraphPoint = { x: 500, y: 260 };
const SIDE_TOP = 96;
const SIDE_BOTTOM = 464;
const NODE_WIDTH = 176;
const EMPTY_NODE_TEXT = '—';

const modeValues: GraphMode[] = ['incoming', 'outgoing', 'other'];

const distributeY = (index: number, total: number): number => {
    if (total <= 1) {
        return ANCHOR_POINT.y;
    }

    return SIDE_TOP + (index * (SIDE_BOTTOM - SIDE_TOP)) / (total - 1);
};

const getModeEdges = (
    graph: IPermissionGraph,
    mode: GraphMode,
    anchorId: string,
): IPermissionGraphEdge[] => {
    if (mode === 'incoming') {
        return graph.edges.filter((edge) => edge.target === anchorId);
    }

    if (mode === 'outgoing') {
        return graph.edges.filter((edge) => edge.source === anchorId);
    }

    return graph.edges.filter(
        (edge) => edge.source !== anchorId && edge.target !== anchorId,
    );
};

const buildPositions = (
    nodes: IPermissionGraphNode[],
    edges: IPermissionGraphEdge[],
    mode: GraphMode,
    anchorId: string,
): Map<string, IGraphPoint> => {
    const positions = new Map<string, IGraphPoint>();

    if (mode !== 'other') {
        positions.set(anchorId, ANCHOR_POINT);
        const sideIds = Array.from(
            new Set(
                edges.map((edge) =>
                    mode === 'incoming' ? edge.source : edge.target,
                ),
            ),
        );
        const x = mode === 'incoming' ? 200 : 800;

        sideIds.forEach((id, index) => {
            positions.set(id, {
                x,
                y: distributeY(index, sideIds.length),
            });
        });

        return positions;
    }

    const sourceIds = Array.from(new Set(edges.map((edge) => edge.source)));
    const targetIds = Array.from(new Set(edges.map((edge) => edge.target)));

    sourceIds.forEach((id, index) => {
        positions.set(id, { x: 260, y: distributeY(index, sourceIds.length) });
    });
    targetIds.forEach((id, index) => {
        positions.set(id, { x: 740, y: distributeY(index, targetIds.length) });
    });

    for (const node of nodes) {
        if (!positions.has(node.id)) {
            positions.set(node.id, ANCHOR_POINT);
        }
    }

    return positions;
};

export const PermissionsGraph: React.FC<IPermissionsGraphProps> = (props) => {
    const {
        rows,
        dao,
        daoPlugins,
        accountRefs,
        isLoading,
        activeAccountAddress,
    } = props;

    const { t } = useTranslations();

    const [mode, setMode] = useState<GraphMode>('incoming');
    const [hoveredEdgeId, setHoveredEdgeId] = useState<string>();
    const [selectedEdgeId, setSelectedEdgeId] = useState<string>();

    const graph = useMemo(() => {
        if (dao == null) {
            return { nodes: [], edges: [] };
        }

        return buildPermissionGraph({ rows, dao, daoPlugins, accountRefs });
    }, [rows, dao, daoPlugins, accountRefs]);

    const anchorId = (activeAccountAddress ?? dao?.address ?? '').toLowerCase();
    const modeEdges = useMemo(
        () => getModeEdges(graph, mode, anchorId),
        [graph, mode, anchorId],
    );
    const visibleNodeIds = new Set(
        modeEdges.flatMap((edge) => [edge.source, edge.target]),
    );
    const visibleNodes = graph.nodes.filter((node) =>
        visibleNodeIds.has(node.id),
    );
    const positions = buildPositions(visibleNodes, modeEdges, mode, anchorId);
    const selectedEdge = graph.edges.find((edge) => edge.id === selectedEdgeId);

    const handleModeChange = (value?: string | string[]) => {
        if (modeValues.includes(value as GraphMode)) {
            setMode(value as GraphMode);
            setSelectedEdgeId(undefined);
            setHoveredEdgeId(undefined);
        }
    };

    if (isLoading || dao == null) {
        return <PermissionsGraphSkeleton />;
    }

    if (graph.edges.length === 0 || modeEdges.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                <GraphModeToggle mode={mode} onModeChange={handleModeChange} />
                <CardEmptyState
                    description={t(
                        'app.settings.daoPermissionsPage.graphView.empty.description',
                    )}
                    heading={t(
                        'app.settings.daoPermissionsPage.graphView.empty.heading',
                    )}
                    objectIllustration={{ object: 'SETTINGS' }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <GraphModeToggle mode={mode} onModeChange={handleModeChange} />
            <div className="relative h-[560px] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0">
                <svg
                    aria-hidden="true"
                    className="absolute inset-0 size-full"
                    preserveAspectRatio="none"
                    viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
                >
                    <defs>
                        <marker
                            id="permission-arrow-neutral"
                            markerHeight="8"
                            markerWidth="8"
                            orient="auto"
                            refX="7"
                            refY="4"
                            viewBox="0 0 8 8"
                        >
                            <path
                                d="M0 0 L8 4 L0 8 Z"
                                fill="var(--color-neutral-300)"
                            />
                        </marker>
                        <marker
                            id="permission-arrow-primary"
                            markerHeight="8"
                            markerWidth="8"
                            orient="auto"
                            refX="7"
                            refY="4"
                            viewBox="0 0 8 8"
                        >
                            <path
                                d="M0 0 L8 4 L0 8 Z"
                                fill="var(--color-primary-500)"
                            />
                        </marker>
                    </defs>
                    {modeEdges.map((edge) => {
                        const source = positions.get(edge.source);
                        const target = positions.get(edge.target);

                        if (source == null || target == null) {
                            return null;
                        }

                        const isActive =
                            selectedEdgeId === edge.id ||
                            hoveredEdgeId === edge.id;

                        return (
                            <line
                                className={classNames(
                                    'transition-colors',
                                    isActive
                                        ? 'text-primary-500'
                                        : 'text-neutral-300',
                                )}
                                key={edge.id}
                                markerEnd={`url(#permission-arrow-${isActive ? 'primary' : 'neutral'})`}
                                stroke="currentColor"
                                strokeWidth={isActive ? 2.5 : 1.5}
                                x1={source.x}
                                x2={target.x}
                                y1={source.y}
                                y2={target.y}
                            />
                        );
                    })}
                </svg>

                {visibleNodes.map((node) => {
                    const point = positions.get(node.id);

                    if (point == null) {
                        return null;
                    }

                    return (
                        <GraphNode
                            key={node.id}
                            node={node}
                            point={point}
                            selectedEdge={selectedEdge}
                        />
                    );
                })}

                {modeEdges.map((edge, index) => {
                    const source = positions.get(edge.source);
                    const target = positions.get(edge.target);

                    if (source == null || target == null) {
                        return null;
                    }

                    const midpoint = {
                        x: (source.x + target.x) / 2,
                        y: (source.y + target.y) / 2 + (index % 3) * 18 - 18,
                    };
                    const isSelected = selectedEdgeId === edge.id;
                    const isHovered = hoveredEdgeId === edge.id;

                    return (
                        <button
                            className={classNames(
                                'absolute z-20 max-w-48 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-md border px-2 py-1 text-left font-mono text-[11px] shadow-neutral-sm transition-colors',
                                isSelected
                                    ? 'border-primary-500 bg-primary-500 text-neutral-0'
                                    : 'border-neutral-200 bg-neutral-800 text-neutral-0 hover:border-primary-400 hover:bg-neutral-700',
                                isHovered &&
                                    !isSelected &&
                                    'border-primary-300 bg-neutral-700',
                            )}
                            key={edge.id}
                            onClick={() => setSelectedEdgeId(edge.id)}
                            onMouseEnter={() => setHoveredEdgeId(edge.id)}
                            onMouseLeave={() => setHoveredEdgeId(undefined)}
                            style={{
                                left: `${(midpoint.x / GRAPH_WIDTH) * 100}%`,
                                top: `${(midpoint.y / GRAPH_HEIGHT) * 100}%`,
                            }}
                            type="button"
                        >
                            <span className="block truncate">
                                {edge.permissionName}
                            </span>
                            {edge.conditionLabel != null && (
                                <span
                                    className={classNames(
                                        'mt-0.5 block w-fit rounded bg-neutral-0 px-1 text-neutral-800',
                                        isSelected && 'text-primary-700',
                                    )}
                                >
                                    {t(
                                        'app.settings.daoPermissionsPage.graphView.edge.condition',
                                        { condition: edge.conditionLabel },
                                    )}
                                </span>
                            )}
                        </button>
                    );
                })}

                {selectedEdge != null && (
                    <PermissionDetailPanel
                        edge={selectedEdge}
                        nodes={graph.nodes}
                        onClose={() => setSelectedEdgeId(undefined)}
                    />
                )}
            </div>
        </div>
    );
};

interface IGraphModeToggleProps {
    mode: GraphMode;
    onModeChange: (value?: string | string[]) => void;
}

const GraphModeToggle: React.FC<IGraphModeToggleProps> = ({
    mode,
    onModeChange,
}) => {
    const { t } = useTranslations();

    return (
        <ToggleGroup isMultiSelect={false} onChange={onModeChange} value={mode}>
            <Toggle
                label={t(
                    'app.settings.daoPermissionsPage.graphView.mode.incoming',
                )}
                value="incoming"
            />
            <Toggle
                label={t(
                    'app.settings.daoPermissionsPage.graphView.mode.outgoing',
                )}
                value="outgoing"
            />
            <Toggle
                label={t(
                    'app.settings.daoPermissionsPage.graphView.mode.other',
                )}
                value="other"
            />
        </ToggleGroup>
    );
};

interface IGraphNodeProps {
    node: IPermissionGraphNode;
    point: IGraphPoint;
    selectedEdge?: IPermissionGraphEdge;
}

const GraphNode: React.FC<IGraphNodeProps> = ({
    node,
    point,
    selectedEdge,
}) => {
    const { t } = useTranslations();
    const isDaoKind = node.kind === 'dao' || node.kind === 'linkedDao';
    const isAffected =
        selectedEdge != null &&
        (selectedEdge.source === node.id || selectedEdge.target === node.id);
    const isDimmed = selectedEdge != null && !isAffected;

    return (
        <div
            className={classNames(
                'absolute z-10 flex min-h-16 -translate-x-1/2 -translate-y-1/2 items-center justify-between gap-3 rounded-lg border bg-neutral-0 px-3 py-2 shadow-neutral-sm transition-colors',
                isAffected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200',
                isDimmed && 'opacity-45',
            )}
            style={{
                left: `${(point.x / GRAPH_WIDTH) * 100}%`,
                top: `${(point.y / GRAPH_HEIGHT) * 100}%`,
                width: NODE_WIDTH,
            }}
        >
            <div className="min-w-0">
                <p className="truncate font-medium text-neutral-800 text-sm">
                    {node.label || EMPTY_NODE_TEXT}
                </p>
                <p className="truncate text-neutral-500 text-xs">
                    {t(
                        `app.settings.daoPermissionsPage.graphView.node.${node.kind}`,
                    )}
                </p>
            </div>
            {isDaoKind && (
                <DaoAvatar
                    name={node.label}
                    size="sm"
                    src={node.avatarSrc ?? undefined}
                />
            )}
            {node.kind === 'plugin' && node.tag != null && (
                <Tag className="shrink-0" label={node.tag} variant="primary" />
            )}
            {node.kind === 'actor' && <Avatar size="sm" />}
        </div>
    );
};

interface IPermissionDetailPanelProps {
    edge: IPermissionGraphEdge;
    nodes: IPermissionGraphNode[];
    onClose: () => void;
}

const PermissionDetailPanel: React.FC<IPermissionDetailPanelProps> = ({
    edge,
    nodes,
    onClose,
}) => {
    const { t } = useTranslations();
    const { row } = edge;
    const who = nodes.find((node) => node.id === edge.source);
    const where = nodes.find((node) => node.id === edge.target);
    const hasCondition = !addressUtils.isAddressEqual(
        row.conditionAddress,
        ALLOW_FLAG,
    );
    const conditionType = conditionTypeUtils.resolveConditionType(
        row.conditionAddress,
        row.condition,
    );

    const isWhoAnyAddress = addressUtils.isAddressEqual(
        row.whoAddress,
        ANY_ADDR,
    );
    const isWhereAnyAddress = addressUtils.isAddressEqual(
        row.whereAddress,
        ANY_ADDR,
    );

    return (
        <div className="absolute top-4 right-4 z-30 max-h-[calc(100%-32px)] w-[360px] overflow-auto rounded-lg border border-neutral-200 bg-neutral-0 p-4 shadow-neutral-md">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-mono text-neutral-900 text-sm">
                        {edge.permissionName}
                    </p>
                    {edge.conditionLabel != null && (
                        <p className="mt-1 w-fit rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-700 text-xs">
                            {t(
                                'app.settings.daoPermissionsPage.graphView.edge.condition',
                                { condition: edge.conditionLabel },
                            )}
                        </p>
                    )}
                </div>
                <Button
                    aria-label={t(
                        'app.settings.daoPermissionsPage.graphView.detail.close',
                    )}
                    iconLeft={IconType.CLOSE}
                    onClick={onClose}
                    size="sm"
                    variant="tertiary"
                />
            </div>
            <div className="flex flex-col gap-4">
                <DefinitionList.Container>
                    <DefinitionList.Item
                        copyValue={isWhoAnyAddress ? undefined : row.whoAddress}
                        description={who?.label}
                        term={t('app.settings.permissionsList.details.who')}
                    >
                        {isWhoAnyAddress
                            ? who?.label
                            : addressUtils.truncateAddress(row.whoAddress)}
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        copyValue={
                            isWhereAnyAddress ? undefined : row.whereAddress
                        }
                        description={where?.label}
                        term={t('app.settings.permissionsList.details.where')}
                    >
                        {isWhereAnyAddress
                            ? where?.label
                            : addressUtils.truncateAddress(row.whereAddress)}
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        copyValue={row.permissionId}
                        description={edge.permissionName}
                        term={t(
                            'app.settings.permissionsList.details.permission',
                        )}
                    >
                        {addressUtils.truncateHash(row.permissionId)}
                    </DefinitionList.Item>
                </DefinitionList.Container>
                <div className="flex flex-col gap-2">
                    <p className="font-medium text-neutral-800 text-sm">
                        {t('app.settings.permissionsList.condition.heading')}
                    </p>
                    <PluginSingleComponent
                        Fallback={NoConditionSlot}
                        pluginId={conditionType}
                        slotId={SettingsSlotId.PERMISSION_CONDITION}
                        {...(hasCondition ? row.condition : undefined)}
                    />
                </div>
            </div>
        </div>
    );
};

const PermissionsGraphSkeleton: React.FC = () => (
    <div
        className="flex h-[560px] w-full flex-col gap-4 rounded-lg border border-neutral-200 p-6"
        data-testid="permissions-graph-skeleton"
    >
        <StateSkeletonBar width="36%" />
        <StateSkeletonBar width="64%" />
        <StateSkeletonBar width="48%" />
    </div>
);
