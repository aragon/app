'use client';

import { CardEmptyState, StateSkeletonBar } from '@aragon/gov-ui-kit';
import '@xyflow/react/dist/style.css';
import { ReactFlowProvider } from '@xyflow/react';
import { useMemo, useState } from 'react';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IPermissionRow } from '../../types';
import { buildPermissionGraph } from '../../utils/buildPermissionGraph';
import type { IPermissionAccountRef } from '../../utils/permissionEntityUtils';
import { PermissionDetailPanel } from './permissionDetailPanel';
import { PermissionNodeDetailPanel } from './permissionNodeDetailPanel';
import {
    type GraphMode,
    PermissionsGraphCanvas,
    useModeEdges,
} from './permissionsGraphCanvas';

export interface IPermissionsGraphProps {
    rows: IPermissionRow[];
    dao?: IDao;
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    accountRefs: IPermissionAccountRef[];
    isLoading: boolean;
    activeAccountAddress?: string;
    mode: GraphMode;
}

export const PermissionsGraph: React.FC<IPermissionsGraphProps> = (props) => {
    const {
        rows,
        dao,
        daoPlugins,
        accountRefs,
        isLoading,
        activeAccountAddress,
        mode,
    } = props;

    const { t } = useTranslations();

    const [selectedEdgeId, setSelectedEdgeId] = useState<string>();
    const [selectedNodeId, setSelectedNodeId] = useState<string>();

    const graph = useMemo(() => {
        if (dao == null) {
            return { nodes: [], edges: [] };
        }

        return buildPermissionGraph({ rows, dao, daoPlugins, accountRefs });
    }, [rows, dao, daoPlugins, accountRefs]);

    const anchorId = (activeAccountAddress ?? dao?.address ?? '').toLowerCase();
    const modeEdges = useModeEdges(graph, mode, anchorId);
    const visibleNodeIds = new Set(
        modeEdges.flatMap((edge) => [edge.source, edge.target]),
    );
    const selectedEdge = modeEdges.find((edge) => edge.id === selectedEdgeId);
    const selectedNode = graph.nodes.find(
        (node) => node.id === selectedNodeId && visibleNodeIds.has(node.id),
    );

    if (isLoading || dao == null) {
        return <PermissionsGraphSkeleton />;
    }

    if (graph.edges.length === 0 || modeEdges.length === 0) {
        return (
            <CardEmptyState
                description={t(
                    'app.settings.daoPermissionsPage.graphView.empty.description',
                )}
                heading={t(
                    'app.settings.daoPermissionsPage.graphView.empty.heading',
                )}
                objectIllustration={{ object: 'SETTINGS' }}
            />
        );
    }

    return (
        <div className="relative h-[640px] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0">
            <ReactFlowProvider key={`${anchorId}-${mode}`}>
                <PermissionsGraphCanvas
                    anchorId={anchorId}
                    graph={graph}
                    mode={mode}
                    onSelectedEdgeChange={setSelectedEdgeId}
                    onSelectedNodeChange={setSelectedNodeId}
                    selectedEdgeId={selectedEdgeId}
                    selectedNodeId={selectedNodeId}
                />
            </ReactFlowProvider>
            {selectedEdge != null && (
                <PermissionDetailPanel
                    chainId={networkDefinitions[dao.network].id}
                    edge={selectedEdge}
                    network={dao.network}
                    nodes={graph.nodes}
                    onClose={() => setSelectedEdgeId(undefined)}
                />
            )}
            {selectedNode != null && (
                <PermissionNodeDetailPanel
                    chainId={networkDefinitions[dao.network].id}
                    node={selectedNode}
                    onClose={() => setSelectedNodeId(undefined)}
                />
            )}
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
