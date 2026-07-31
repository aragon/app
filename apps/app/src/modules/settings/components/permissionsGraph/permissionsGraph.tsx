'use client';

import {
    Button,
    CardEmptyState,
    IconType,
    StateSkeletonBar,
} from '@aragon/gov-ui-kit';
import '@xyflow/react/dist/style.css';
import { ReactFlowProvider } from '@xyflow/react';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IPermissionRow } from '../../types';
import { buildPermissionGraph } from '../../utils/buildPermissionGraph';
import type { IPermissionAccountRef } from '../../utils/permissionEntityUtils';
import { PermissionDetailPanel } from './permissionDetailPanel';
import { PermissionNodeDetailPanel } from './permissionNodeDetailPanel';
import { PermissionsGraphCanvas } from './permissionsGraphCanvas';

export interface IPermissionsGraphProps {
    rows: IPermissionRow[];
    dao?: IDao;
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    accountRefs: IPermissionAccountRef[];
    isLoading: boolean;
    activeAccountAddress?: string;
}

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

    const [selectedEdgeId, setSelectedEdgeId] = useState<string>();
    const [selectedNodeId, setSelectedNodeId] = useState<string>();
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (!isFullScreen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isFullScreen]);

    useEffect(() => {
        if (!isFullScreen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            setIsFullScreen(false);
        };
        window.addEventListener('keydown', handleEscape, { capture: true });

        return () => {
            window.removeEventListener('keydown', handleEscape, {
                capture: true,
            });
        };
    }, [isFullScreen]);

    const graph = useMemo(() => {
        if (dao == null) {
            return { nodes: [], edges: [] };
        }

        return buildPermissionGraph({ rows, dao, daoPlugins, accountRefs });
    }, [rows, dao, daoPlugins, accountRefs]);

    const anchorId = (activeAccountAddress ?? dao?.address ?? '').toLowerCase();
    const visibleEdges = graph.edges;
    const visibleNodeIds = new Set(
        visibleEdges.flatMap((edge) => [edge.source, edge.target]),
    );
    const selectedEdge = visibleEdges.find(
        (edge) => edge.id === selectedEdgeId,
    );
    const selectedNode = graph.nodes.find(
        (node) => node.id === selectedNodeId && visibleNodeIds.has(node.id),
    );

    if (isLoading || dao == null) {
        return <PermissionsGraphSkeleton />;
    }

    if (graph.edges.length === 0 || visibleEdges.length === 0) {
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
        <div
            className={classNames(
                'overflow-hidden border border-neutral-200 bg-neutral-0',
                isFullScreen
                    ? 'fixed top-0 left-0 z-[var(--guk-text-area-rich-text-expanded-z-index)] h-screen w-screen rounded-none'
                    : 'relative h-[640px] rounded-lg',
            )}
            data-testid="permissions-graph-container"
        >
            <ReactFlowProvider key={anchorId}>
                <PermissionsGraphCanvas
                    anchorId={anchorId}
                    graph={graph}
                    onSelectedEdgeChange={setSelectedEdgeId}
                    onSelectedNodeChange={setSelectedNodeId}
                    selectedEdgeId={selectedEdgeId}
                    selectedNodeId={selectedNodeId}
                />
            </ReactFlowProvider>
            <Button
                aria-label={t(
                    isFullScreen
                        ? 'app.settings.daoPermissionsPage.graphView.fullscreen.close'
                        : 'app.settings.daoPermissionsPage.graphView.fullscreen.open',
                )}
                className="absolute right-4 bottom-4 z-10 shadow-neutral-sm"
                iconLeft={isFullScreen ? IconType.SHRINK : IconType.EXPAND}
                onClick={() => setIsFullScreen((current) => !current)}
                size="sm"
                variant="tertiary"
            />
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
